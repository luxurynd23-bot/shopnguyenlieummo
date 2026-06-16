import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

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

  const settings = await prisma.setting.findMany();

  const data: any = {};

  settings.forEach((s) => {
    data[s.key] = s.value;
  });

  return NextResponse.json({ settings: data });
}

export async function POST(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json(
      { message: "Không có quyền" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    for (const key of Object.keys(body)) {
      await prisma.setting.upsert({
        where: { key },
        update: {
          value: String(body[key]),
        },
        create: {
          key,
          value: String(body[key]),
        },
      });
    }

    return NextResponse.json({
      message: "Đã lưu cài đặt",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Lỗi lưu cài đặt",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}