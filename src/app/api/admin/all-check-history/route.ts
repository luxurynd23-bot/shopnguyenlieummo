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

const q = searchParams.get("q") || "";
const from = searchParams.get("from");
const to = searchParams.get("to");

const history = await prisma.tiktokCheckHistory.findMany({
  where: {
    AND: [
      from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to
                ? {
                    lte: new Date(
                      new Date(to).setHours(23, 59, 59, 999)
                    ),
                  }
                : {}),
            },
          }
        : {},

      q
        ? {
            OR: [
              { trackingNo: { contains: q } },
              { orderId: { contains: q } },
              { shopName: { contains: q } },
              { shipperName: { contains: q } },
              { phone: { contains: q } },
              { product: { contains: q } },
            ],
          }
        : {},
    ],
  },

  orderBy: {
    createdAt: "desc",
  },

  take: 500,

  include: {
    user: {
      select: {
        id: true,
        email: true,
        name: true,
        balance: true,
      },
    },
  },
});

    return NextResponse.json({ history });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Lỗi lấy lịch sử MVD admin" },
      { status: 500 }
    );
  }
}