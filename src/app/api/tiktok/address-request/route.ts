import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const CHANGE_COST = 500;
const API_COST = 0;

function hashCookie(cookie: string) {
  return crypto.createHash("sha256").update(cookie.trim()).digest("hex");
}

async function getUser(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  const token = cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) return null;

  const decoded: any = jwt.verify(
    token,
    process.env.JWT_SECRET || "shop_mmo_secret_123456"
  );

  return prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      role: true,
      balance: true,
    },
  });
}

export async function POST(req: Request) {
  try {
    const user = await getUser(req);

    if (!user) {
      return NextResponse.json(
        { message: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      cookie,
      orderId,
      mode,
      name,
      phone,
      address,
      newAddressId,
    } = body;

    if (!cookie || !orderId) {
      return NextResponse.json(
        { message: "Thiếu dữ liệu" },
        { status: 400 }
      );
    }

    if (
      user.role !== "ADMIN" &&
      user.balance < CHANGE_COST
    ) {
      return NextResponse.json(
        {
          message: "Số dư không đủ",
        },
        { status: 402 }
      );
    }

    const cookieHash = hashCookie(cookie);

    await prisma.$transaction(async (tx) => {
      if (user.role !== "ADMIN") {
        await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            balance: {
              decrement: CHANGE_COST,
            },
          },
        });

        await tx.walletHistory.create({
          data: {
            userId: user.id,
            type: "CHANGE_ADDRESS",
            amount: -CHANGE_COST,
            note: `Đổi địa chỉ đơn ${orderId}`,
          },
        });
      }

      await tx.tiktokAddressHistory.create({
        data: {
          userId: user.id,
          mode,
          orderId,
          cookieHash,
          name,
          phone,
          address,
          newAddressId,
          cost: user.role === "ADMIN" ? 0 : CHANGE_COST,
          apiCost: API_COST,
          profit: user.role === "ADMIN" ? 0 : CHANGE_COST,
          status: "PENDING",
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Đã tạo yêu cầu đổi địa chỉ",
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        message: e.message,
      },
      { status: 500 }
    );
  }
}