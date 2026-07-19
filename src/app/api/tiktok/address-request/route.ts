import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendTelegram } from "@/lib/telegram";

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
    select: { id: true, role: true, balance: true },
  });
}

export async function POST(req: Request) {
  try {
    const user = await getUser(req);

    if (!user) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const { cookie, orderId, mode, name, phone, address, newAddressId } = body;

    if (!cookie || !orderId) {
      return NextResponse.json({ message: "Thiếu cookie hoặc orderId" }, { status: 400 });
    }

    if (mode === "CREATE_ADDRESS" && (!name || !phone || !address)) {
      return NextResponse.json({ message: "Thiếu tên, SĐT hoặc địa chỉ" }, { status: 400 });
    }

    if (mode === "ADDRESS_ID" && !newAddressId) {
      return NextResponse.json({ message: "Thiếu Address ID" }, { status: 400 });
    }

    if (user.role !== "ADMIN" && user.balance < CHANGE_COST) {
      return NextResponse.json({ message: "Số dư không đủ" }, { status: 402 });
    }

    const apiKey = process.env.BOTLC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ message: "Thiếu BOTLC_API_KEY trong .env" }, { status: 500 });
    }

    const apiBody =
      mode === "CREATE_ADDRESS"
        ? {
            cookie,
            order_id: orderId,
            auto_create_address: true,
            name,
            phone,
            address,
          }
        : {
            cookie,
            order_id: orderId,
            new_address_id: newAddressId,
            auto_create_address: false,
          };

    const res = await fetch("https://botlc.pro/tiktok/change-address", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(apiBody),
    });

    const apiData = await res.json().catch(() => null);

    if (!res.ok || apiData?.success === false || apiData?.status === false) {
      await prisma.tiktokAddressHistory.create({
        data: {
          userId: user.id,
          mode,
          orderId,
          cookieHash: hashCookie(cookie),
          name,
          phone,
          address,
          newAddressId,
          cost: 0,
          apiCost: API_COST,
          profit: 0,
          status: "FAILED",
          note: apiData?.message || apiData?.msg || "Đổi địa chỉ thất bại",
          raw: apiData,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: apiData?.message || apiData?.msg || "Đổi địa chỉ thất bại",
          data: apiData,
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      if (user.role !== "ADMIN") {
        await tx.user.update({
          where: { id: user.id },
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
          cookieHash: hashCookie(cookie),
          name,
          phone,
          address,
          newAddressId,
          cost: user.role === "ADMIN" ? 0 : CHANGE_COST,
          apiCost: API_COST,
          profit: user.role === "ADMIN" ? 0 : CHANGE_COST - API_COST,
          status: "SUCCESS",
          note: apiData?.message || apiData?.msg || "Đổi địa chỉ thành công",
          raw: apiData,
        },
      });
    });

    await sendTelegram(`
🏠 <b>ĐỔI ĐỊA CHỈ TIKTOK</b>

👤 User ID: ${user.id}
🧾 Order: ${orderId}
🔁 Mode: ${mode}
💰 Thu: ${
      user.role === "ADMIN"
        ? "Admin miễn phí"
        : CHANGE_COST.toLocaleString("vi-VN") + "đ"
    }
`);

    return NextResponse.json({
      success: true,
      message: apiData?.message || apiData?.msg || "Đổi địa chỉ thành công",
      data: apiData,
    });
  } catch (error: any) {
    await sendTelegram(`
🚨 <b>LỖI ĐỔI ĐỊA CHỈ TIKTOK</b>

❌ ${error?.message || String(error)}
`);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Lỗi đổi địa chỉ",
      },
      { status: 500 }
    );
  }
}