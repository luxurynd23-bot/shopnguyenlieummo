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
    select: { id: true, role: true },
  });

  if (!user || user.role !== "ADMIN") return null;

  return user;
}

export async function GET(req: Request) {
  try {
    const admin = await getAdmin(req);

    if (!admin) {
      return NextResponse.json(
        { message: "Không có quyền admin" },
        { status: 403 }
      );
    }

    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
const start7Days = new Date();
start7Days.setDate(start7Days.getDate() - 7);
start7Days.setHours(0, 0, 0, 0);

const start30Days = new Date();
start30Days.setDate(start30Days.getDate() - 30);
start30Days.setHours(0, 0, 0, 0);
    const totalCheck = await prisma.tiktokCheckHistory.count();

    const todayCheck = await prisma.tiktokCheckHistory.count({
      where: {
        createdAt: {
          gte: startToday,
        },
      },
    });

    const totalRevenue = await prisma.tiktokCheckHistory.aggregate({
      _sum: {
        cost: true,
      },
    });

    const todayRevenue = await prisma.tiktokCheckHistory.aggregate({
      where: {
        createdAt: {
          gte: startToday,
        },
      },
      _sum: {
        cost: true,
      },
    });
const totalApiCost = await prisma.tiktokCheckHistory.aggregate({
  _sum: {
    apiCost: true,
  },
});

const totalProfit = await prisma.tiktokCheckHistory.aggregate({
  _sum: {
    profit: true,
  },
});

const todayApiCost = await prisma.tiktokCheckHistory.aggregate({
  where: {
    createdAt: {
      gte: startToday,
    },
  },
  _sum: {
    apiCost: true,
  },
});

const todayProfit = await prisma.tiktokCheckHistory.aggregate({
  where: {
    createdAt: {
      gte: startToday,
    },
  },
  _sum: {
    profit: true,
  },
});
const sevenDayStats = await prisma.tiktokCheckHistory.aggregate({
  where: {
    createdAt: {
      gte: start7Days,
    },
  },
  _count: {
    id: true,
  },
  _sum: {
    cost: true,
    apiCost: true,
    profit: true,
  },
});

const thirtyDayStats = await prisma.tiktokCheckHistory.aggregate({
  where: {
    createdAt: {
      gte: start30Days,
    },
  },
  _count: {
    id: true,
  },
  _sum: {
    cost: true,
    apiCost: true,
    profit: true,
  },
});
    const totalUsersCheckedRaw = await prisma.tiktokCheckHistory.groupBy({
  by: ["userId"],
});

const totalUsersChecked = totalUsersCheckedRaw.length;

const topUsersRaw = await prisma.tiktokCheckHistory.groupBy({
  by: ["userId"],
  _count: {
    id: true,
  },
  _sum: {
    cost: true,
  },
  orderBy: {
    _count: {
      id: "desc",
    },
  },
  take: 10,
});

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: topUsersRaw.map((x) => x.userId),
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const topUsers = topUsersRaw.map((x) => ({
      userId: x.userId,
      email: userMap.get(x.userId)?.email || "",
      name: userMap.get(x.userId)?.name || "",
      count: x._count.id,
      revenue: x._sum.cost || 0,
    }));

    return NextResponse.json({
  totalCheck,
  todayCheck,
  totalUsersChecked,
  totalRevenue: totalRevenue._sum.cost || 0,
  todayRevenue: todayRevenue._sum.cost || 0,

  totalApiCost: totalApiCost._sum.apiCost || 0,
  todayApiCost: todayApiCost._sum.apiCost || 0,

  totalProfit: totalProfit._sum.profit || 0,
  todayProfit: todayProfit._sum.profit || 0,

  sevenDayCheck: sevenDayStats._count.id || 0,
  sevenDayRevenue: sevenDayStats._sum.cost || 0,
  sevenDayApiCost: sevenDayStats._sum.apiCost || 0,
  sevenDayProfit: sevenDayStats._sum.profit || 0,

  thirtyDayCheck: thirtyDayStats._count.id || 0,
  thirtyDayRevenue: thirtyDayStats._sum.cost || 0,
  thirtyDayApiCost: thirtyDayStats._sum.apiCost || 0,
  thirtyDayProfit: thirtyDayStats._sum.profit || 0,

  topUsers,
});
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Lỗi thống kê check MVD",
      },
      { status: 500 }
    );
  }
}