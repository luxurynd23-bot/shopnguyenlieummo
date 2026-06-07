import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

async function checkAdmin(req: Request) {
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
}

export async function GET(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ message: "Khong co quyen" }, { status: 403 });
  }

  const totalUsers = await prisma.user.count();
  const totalOrders = await prisma.order.count();

  const deposits = await prisma.deposit.findMany({
    where: { status: "PAID" },
  });

  const totalDeposit = deposits.reduce((sum, d) => sum + d.amount, 0);

  const orders = await prisma.order.findMany();
  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);

  const stockLeft = await prisma.accountItem.count({
    where: { sold: false },
  });

  const revenueByDayMap: Record<string, number> = {};

orders.forEach((o) => {
  const day = new Date(o.createdAt).toLocaleDateString("vi-VN");
  revenueByDayMap[day] = (revenueByDayMap[day] || 0) + o.amount;
});

const revenueByDay = Object.entries(revenueByDayMap).map(([day, total]) => ({
  day,
  total,
}));

return NextResponse.json({
  totalUsers,
  totalOrders,
  totalDeposit,
  totalRevenue,
  stockLeft,
  revenueByDay,
});
}