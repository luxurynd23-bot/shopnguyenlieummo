import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

function makeReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";

    const token = cookie
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "shop_mmo_secret_123456"
    );

    let user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        referralCode: true,
        referredBy: true,
        email: true,
        referralBalance: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Không tìm thấy user" },
        { status: 404 }
      );
    }

    if (!user.referralCode) {
      let newCode = makeReferralCode();

      for (let i = 0; i < 5; i++) {
        const existed = await prisma.user.findUnique({
          where: { referralCode: newCode },
        });

        if (!existed) break;

        newCode = makeReferralCode();
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: newCode },
        select: {
          id: true,
          referralCode: true,
          referredBy: true,
          email: true,
          referralBalance: true,
        },
      });
    }

    const referralCount = await prisma.user.count({
      where: {
        referredBy: user.referralCode,
      },
    });

    return NextResponse.json({
      user: {
        ...user,
        referralCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Lỗi xác thực",
        error: error?.message || String(error),
      },
      { status: 401 }
    );
  }
}