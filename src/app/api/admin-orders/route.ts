import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

async function checkAdmin(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const token = cookie
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) return false;

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "shop_mmo_secret_123456"
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { role: true },
    });

    return user?.role === "ADMIN";
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json(
      { message: "Không có quyền" },
      { status: 403 }
    );
  }

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const result = orders.map((order) => {
      const user = users.find((u) => u.id === order.userId);

      return {
        ...order,
        email: user?.email || "Không rõ",
        name: user?.name || "",
      };
    });

    return NextResponse.json({ orders: result });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Lỗi tải đơn hàng",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}