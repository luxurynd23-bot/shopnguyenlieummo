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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json(
      { message: "Không có quyền" },
      { status: 403 }
    );
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      deposits: {
        orderBy: {
          createdAt: "desc",
        },
      },
      orders: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Không tìm thấy user" },
      { status: 404 }
    );
  }

  return NextResponse.json({ user });
}