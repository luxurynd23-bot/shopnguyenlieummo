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

export async function GET(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
  }

  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json({ tickets });
}

export async function POST(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
  }

  const body = await req.json();

  const id = String(body.id || "");
  const adminReply = String(body.adminReply || "").trim();

  if (!id || !adminReply) {
    return NextResponse.json(
      { message: "Thiếu id hoặc nội dung trả lời" },
      { status: 400 }
    );
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data: {
      adminReply,
      status: "ANSWERED",
    },
  });

  return NextResponse.json({
    message: "Đã trả lời ticket",
    ticket,
  });
}