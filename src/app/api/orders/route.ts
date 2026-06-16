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
        { orders: [] },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "shop_mmo_secret_123456"
    );

    const orders = await prisma.order.findMany({
      where: {
        userId: decoded.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        productName: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      orders,
    });
  } catch {
    return NextResponse.json(
      { orders: [] },
      { status: 401 }
    );
  }
}