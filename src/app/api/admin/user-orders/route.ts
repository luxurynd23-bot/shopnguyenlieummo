import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

async function getAdmin(req: Request) {
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

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, role: true, isBanned: true },
  });

  if (!user || user.role !== "ADMIN" || user.isBanned) return null;

  return user;
}

export async function GET(req: Request) {
  try {
    const admin = await getAdmin(req);

    if (!admin) {
      return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        items: {
          select: {
            id: true,
            content: true,
            soldAt: true,
          },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Lỗi lấy lịch sử mua hàng admin" },
      { status: 500 }
    );
  }
}