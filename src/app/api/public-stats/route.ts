import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalUsers = await prisma.user.count();

    const totalOrders = await prisma.order.count();

    const stockLeft = await prisma.accountItem.count({
      where: {
        sold: false,
      },
    });

    const deposits = await prisma.deposit.findMany({
      where: {
        status: "SUCCESS",
      },
      select: {
        amount: true,
      },
    });

    const totalDeposit = deposits.reduce(
      (sum, d) => sum + d.amount,
      0
    );

    return NextResponse.json({
      totalUsers,
      totalOrders,
      stockLeft,
      totalDeposit,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Lỗi public stats",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}