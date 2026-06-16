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
        { message: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "shop_mmo_secret_123456"
    );

    const history = await prisma.walletHistory.findMany({
      where: {
        userId: decoded.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json({
      history,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Lỗi",
      },
      { status: 500 }
    );
  }
}