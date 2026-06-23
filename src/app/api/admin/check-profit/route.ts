import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

async function getAdmin(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const token = cookie.split("; ").find((c) => c.startsWith("token="))?.split("=")[1];
  if (!token) return null;

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "shop_mmo_secret_123456");

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { role: true, isBanned: true },
  });

  if (!user || user.role !== "ADMIN" || user.isBanned) return null;
  return user;
}

export async function GET(req: Request) {
  const admin = await getAdmin(req);
  if (!admin) {
    return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
  }

  const items = await prisma.tiktokCheckHistory.findMany({
    select: {
      cost: true,
      apiCost: true,
      profit: true,
    },
  });

  const totalChecks = items.length;
  const totalRevenue = items.reduce((s, x) => s + Number(x.cost || 0), 0);
  const totalApiCost = items.reduce((s, x) => s + Number(x.apiCost || 0), 0);
  const totalProfit = items.reduce((s, x) => s + Number(x.profit || 0), 0);

  return NextResponse.json({
    totalChecks,
    totalRevenue,
    totalApiCost,
    totalProfit,
  });
}