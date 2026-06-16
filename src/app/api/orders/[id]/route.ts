import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

async function getUserFromToken(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const token = cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) return null;

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "shop_mmo_secret_123456"
    );

    return await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        role: true,
      },
    });
  } catch {
    return null;
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { message: "ID đơn hàng không hợp lệ" },
        { status: 400 }
      );
    }

    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        ...(user.role !== "ADMIN" ? { userId: user.id } : {}),
      },
      select: {
        id: true,
        userId: true,
        productId: true,
        productName: true,
        amount: true,
        content: true,
        status: true,
        createdAt: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    const accounts = String(order.content || "")
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean);

    return NextResponse.json({
      order,
      accounts,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Lỗi lấy chi tiết đơn hàng",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}