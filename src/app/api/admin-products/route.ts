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

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ message: "Khong co quyen" }, { status: 403 });
  }

  const body = await req.json();

  const product = await prisma.product.create({
    data: {
      name: body.name,
      price: Number(body.price),
      stock: Number(body.stock || 0),
      content: body.content || "",
    },
  });

  return NextResponse.json({ product });
}

export async function PUT(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ message: "Khong co quyen" }, { status: 403 });
  }

  const body = await req.json();

  const product = await prisma.product.update({
    where: { id: body.id },
    data: {
      name: body.name,
      price: Number(body.price),
      stock: Number(body.stock || 0),
      content: body.content || "",
    },
  });

  return NextResponse.json({ product });
}

export async function DELETE(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ message: "Khong co quyen" }, { status: 403 });
  }

  const body = await req.json();

  await prisma.product.delete({
    where: { id: body.id },
  });

  return NextResponse.json({ message: "Da xoa san pham" });
}