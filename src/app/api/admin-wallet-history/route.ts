import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

async function checkAdmin(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  const token = cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) return false;

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "shop_mmo_secret_123456"
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { role: true },
    });

    return user?.role === "ADMIN";
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json(
      { message: "Không có quyền" },
      { status: 403 }
    );
  }

  const items = await prisma.walletHistory.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    take: 500,
  });

  return NextResponse.json({
    items,
  });
}