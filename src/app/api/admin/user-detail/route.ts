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

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "Thiếu userId" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        balance: true,
        totalDeposit: true,
        referralBalance: true,
        vipLevel: true,
        role: true,
        isBanned: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Không tìm thấy user" }, { status: 404 });
    }

    const deposits = await prisma.deposit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        items: {
          select: {
            id: true,
            content: true,
            soldAt: true,
          },
        },
      },
    });

    const checks = await prisma.tiktokCheckHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const walletHistories = await prisma.walletHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const summary = {
      totalDeposit: deposits
        .filter((d) => d.status === "SUCCESS")
        .reduce((s, d) => s + Number(d.amount || 0), 0),

      totalBuy: orders.reduce((s, o) => s + Number(o.amount || 0), 0),

      totalCheckCost: checks.reduce((s, c) => s + Number(c.cost || 0), 0),

      totalCheckProfit: checks.reduce((s, c) => s + Number(c.profit || 0), 0),

      totalOrders: orders.length,
      totalChecks: checks.length,
    };

    return NextResponse.json({
      user,
      summary,
      deposits,
      orders,
      checks,
      walletHistories,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Lỗi lấy chi tiết user" },
      { status: 500 }
    );
  }
}