import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();

    const totalDepositAgg = await prisma.deposit.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    });

    const totalSalesAgg = await prisma.order.aggregate({
      _sum: { amount: true },
    });

    const totalWalletAgg = await prisma.user.aggregate({
      _sum: { balance: true },
    });

    const stockAgg = await prisma.product.aggregate({
      _sum: { stock: true },
    });

    const openTickets = await prisma.ticket.count({
      where: { status: "OPEN" },
    });

    const commissionAgg = await prisma.referralCommission.aggregate({
      _sum: { commission: true },
    });

    const couponAgg = await prisma.couponUsage.aggregate({
      _sum: { discount: true },
    });

    const checkRevenueAgg = await prisma.tiktokCheckHistory.aggregate({
      _sum: { cost: true },
    });

    const checkProfitAgg = await prisma.tiktokCheckHistory.aggregate({
      _sum: { profit: true },
    });

    const topProductsRaw = await prisma.order.groupBy({
      by: ["productName"],
      _count: { id: true },
      _sum: { amount: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    const topProducts = topProductsRaw.map((p) => ({
      productName: p.productName,
      count: p._count.id,
      revenue: p._sum.amount || 0,
    }));

    const topUsers = await prisma.user.findMany({
      orderBy: { totalDeposit: "desc" },
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        vipLevel: true,
        totalDeposit: true,
      },
    });

    const revenueByDayRaw = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        amount: true,
        createdAt: true,
      },
    });

    const dayMap = new Map<string, number>();

    revenueByDayRaw.forEach((order) => {
      const day = new Date(order.createdAt).toLocaleDateString("vi-VN");
      dayMap.set(day, (dayMap.get(day) || 0) + Number(order.amount || 0));
    });

    const revenueByDay = Array.from(dayMap.entries())
      .slice(0, 7)
      .map(([day, total]) => ({ day, total }));

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalOrders,

      totalRevenue: totalSalesAgg._sum.amount || 0,
      totalDeposit: totalDepositAgg._sum.amount || 0,
      totalWallet: totalWalletAgg._sum.balance || 0,

      stockLeft: stockAgg._sum.stock || 0,
      openTickets,

      totalCommission: commissionAgg._sum.commission || 0,
      totalCouponDiscount: couponAgg._sum.discount || 0,

      totalCheckRevenue: checkRevenueAgg._sum.cost || 0,
      totalCheckProfit: checkProfitAgg._sum.profit || 0,

      topProducts,
      topUsers: topUsers.map((u) => ({
        id: u.id,
        user: u.email || u.name || u.id,
        vipLevel: u.vipLevel,
        totalDeposit: u.totalDeposit,
      })),

      revenueByDay,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Lỗi dashboard",
      },
      { status: 500 }
    );
  }
}