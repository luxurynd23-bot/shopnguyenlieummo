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

export async function POST(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ message: "Khong co quyen" }, { status: 403 });
  }

  const body = await req.json();

  const productId = body.productId;
  const lines = String(body.content || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  if (!productId || lines.length === 0) {
    return NextResponse.json(
      { message: "Thieu productId hoac content" },
      { status: 400 }
    );
  }

  await prisma.accountItem.createMany({
    data: lines.map((line) => ({
      productId,
      content: line,
      sold: false,
    })),
  });

  return NextResponse.json({
    message: "Da nhap kho",
    count: lines.length,
  });
}