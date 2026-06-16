import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function maskName(text: string) {
  if (!text) return "...user";

  const clean = String(text).split("@")[0];

  if (clean.length <= 3) {
    return "..." + clean;
  }

  return "..." + clean.slice(-3);
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
      select: {
        id: true,
        userId: true,
        productName: true,
        amount: true,
        createdAt: true,
      },
    });

    const deposits = await prisma.deposit.findMany({
      where: {
        status: "SUCCESS",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
      select: {
        id: true,
        userId: true,
        amount: true,
        bank: true,
        createdAt: true,
      },
    });

    const userIds = Array.from(
      new Set([
        ...orders.map((o) => o.userId),
        ...deposits.map((d) => d.userId),
      ])
    );

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return NextResponse.json({
      orders: orders.map((o) => {
        const u = userMap.get(o.userId);

        return {
          id: o.id,
          user: maskName(u?.name || u?.email || "user"),
          productName: o.productName || "Sản phẩm",
          quantity: 1,
          amount: o.amount,
          createdAt: o.createdAt,
        };
      }),

      deposits: deposits.map((d) => {
        const u = userMap.get(d.userId);

        return {
          id: d.id,
          user: maskName(u?.name || u?.email || "user"),
          amount: d.amount,
          bank: d.bank || "BANK",
          createdAt: d.createdAt,
        };
      }),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Lỗi public activity",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}