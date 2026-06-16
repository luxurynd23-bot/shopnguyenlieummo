import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";

    const token = cookie
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { message: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "shop_mmo_secret_123456"
    );

    const items = await prisma.referralCommission.findMany({
      where: {
        referrerId: decoded.id,
      },
      include: {
        referredUser: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      items,
    });
  } catch {
    return NextResponse.json(
      { message: "Lỗi" },
      { status: 500 }
    );
  }
}