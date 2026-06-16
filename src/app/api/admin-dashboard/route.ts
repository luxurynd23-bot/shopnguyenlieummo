import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

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
      select: {
        role: true,
        isBanned: true,
      },
    });

    return user?.role === "ADMIN" && !user?.isBanned;
  } catch {
    return false;
  }
}

function maskEmail(email: string) {
  const name = String(email || "user").split("@")[0];

  if (name.length <= 3) {
    return "..." + name;
  }

  return "..." + name.slice(-3);
}

export async function GET(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
  }

  try {
    const [
      totalUsers,
      totalOrders,
      openTickets,
      totalDepositAgg,
      totalRevenueAgg,
      stockLeft,
      totalCommission,
      couponDiscount,
      vipBronze,
      vipSilver,
      vipGold,
      vipDiamond,
      orders,
      topUsersRaw,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.order.count(),

      prisma.ticket.count({
        where: {
          status: "OPEN",
        },
      }),

      prisma.deposit.aggregate({
        where: {
          status: "SUCCESS",
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.order.aggregate({
        _sum: {
          amount: true,
        },
      }),

      prisma.accountItem.count({
        where: {
          sold: false,
        },
      }),

      prisma.referralCommission.aggregate({
        _sum: {
          commission: true,
        },
      }),

      prisma.couponUsage.aggregate({
        _sum: {
          discount: true,
        },
      }),

      prisma.user.count({
        where: {
          vipLevel: "BRONZE",
        },
      }),

      prisma.user.count({
        where: {
          vipLevel: "SILVER",
        },
      }),

      prisma.user.count({
        where: {
          vipLevel: "GOLD",
        },
      }),

      prisma.user.count({
        where: {
          vipLevel: "DIAMOND",
        },
      }),

      prisma.order.findMany({
        select: {
          amount: true,
          productName: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.user.findMany({
        orderBy: {
          totalDeposit: "desc",
        },
        take: 10,
        select: {
          id: true,
          email: true,
          name: true,
          totalDeposit: true,
          referralBalance: true,
          vipLevel: true,
        },
      }),
    ]);

    const revenueByDayMap: Record<string, number> = {};

    orders.forEach((o) => {
      const day = o.createdAt.toISOString().slice(0, 10);
      revenueByDayMap[day] = (revenueByDayMap[day] || 0) + o.amount;
    });

    const revenueByDay = Object.entries(revenueByDayMap).map(
      ([day, total]) => ({
        day,
        total,
      })
    );

    const topUsers = topUsersRaw.map((u) => ({
      id: u.id,
      user: maskEmail(u.name || u.email),
      totalDeposit: u.totalDeposit,
      referralBalance: u.referralBalance,
      vipLevel: u.vipLevel,
    }));

    const productMap: Record<
      string,
      { productName: string; count: number; revenue: number }
    > = {};

    orders.forEach((o) => {
      const key = o.productName || "Sản phẩm";

      if (!productMap[key]) {
        productMap[key] = {
          productName: key,
          count: 0,
          revenue: 0,
        };
      }

      productMap[key].count += 1;
      productMap[key].revenue += o.amount;
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalDeposit: totalDepositAgg._sum.amount || 0,
      totalRevenue: totalRevenueAgg._sum.amount || 0,
      stockLeft,
      openTickets,
      totalCommission: totalCommission._sum.commission || 0,
      totalCouponDiscount: couponDiscount._sum.discount || 0,
      vipStats: {
        bronze: vipBronze,
        silver: vipSilver,
        gold: vipGold,
        diamond: vipDiamond,
      },
      revenueByDay,
      topUsers,
      topProducts,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Lỗi tải dashboard",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}