import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";

    const token = cookie
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "shop_mmo_secret_123456"
    );

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        balance: true,
        totalDeposit: true,
        referralBalance: true,
        referralCode: true,
        referredBy: true,
        role: true,
        vipLevel: true,
        isBanned: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }
const totalCheckSpent = await prisma.walletHistory.aggregate({
  where: {
    userId: user.id,
    type: "CHECK_MVD",
  },
  _sum: {
    amount: true,
  },
});
    if (user.isBanned) {
      return NextResponse.json(
        {
          user: null,
          message: "Tài khoản đã bị khóa",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
  user,
  totalCheckSpent: Math.abs(totalCheckSpent._sum.amount || 0),
});
  } catch {
    return NextResponse.json(
      { user: null },
      { status: 401 }
    );
  }
}