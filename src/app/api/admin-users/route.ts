import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

async function checkAdmin(req: Request) {
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
    select: { role: true },
  });

  return user?.role === "ADMIN";
}

export async function GET(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ message: "Khong co quyen" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const result = await Promise.all(
    users.map(async (u) => {
      const orders = await prisma.order.count({
        where: { userId: u.id },
      });

      return {
        id: u.id,
        email: u.email,
        name: u.name,
        balance: u.balance,
        role: u.role,
        orders,
        createdAt: u.createdAt,
      };
    })
  );

  return NextResponse.json({ users: result });
}

export async function POST(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ message: "Khong co quyen" }, { status: 403 });
  }

  const body = await req.json();
  const amount = Number(body.amount);
  const type = body.type;

  if (!body.userId || !amount || !type) {
    return NextResponse.json({ message: "Thieu du lieu" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: body.userId },
    data: {
      balance: type === "add" ? { increment: amount } : { decrement: amount },
    },
  });

  return NextResponse.json({ user });
}