import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function maskName(text: string) {
  if (!text) return "...user";
  const clean = String(text).split("@")[0];
  if (clean.length <= 3) return "..." + clean;
  return "..." + clean.slice(-3);
}

export async function GET() {
  const orders = await prisma.order.findMany({
    select: {
      userId: true,
      amount: true,
    },
  });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  const map: Record<string, number> = {};

  orders.forEach((o) => {
    map[o.userId] = (map[o.userId] || 0) + o.amount;
  });

  const result = users
    .map((u) => ({
      id: u.id,
      user: maskName(u.name || u.email),
      totalBuy: map[u.id] || 0,
    }))
    .sort((a, b) => b.totalBuy - a.totalBuy)
    .slice(0, 10);

  return NextResponse.json({
    topOrders: result,
  });
}