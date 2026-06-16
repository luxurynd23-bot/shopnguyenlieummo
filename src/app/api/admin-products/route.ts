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
    return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
  }

  const body = await req.json();

  if (!body.name || !body.price) {
    return NextResponse.json(
      { message: "Thiếu tên hoặc giá sản phẩm" },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({
    data: {
      name: String(body.name).trim(),
      price: Number(body.price),
      stock: Number(body.stock || 0),
      content: body.content || "",
    },
  });

  return NextResponse.json({ product });
}

export async function PUT(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
  }

  const body = await req.json();

  if (!body.id) {
    return NextResponse.json({ message: "Thiếu ID sản phẩm" }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id: body.id },
    data: {
      name: String(body.name || "").trim(),
      price: Number(body.price || 0),
      stock: Number(body.stock || 0),
      content: body.content || "",
    },
  });

  return NextResponse.json({ product });
}

export async function DELETE(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
  }

  const body = await req.json();

  if (!body.id) {
    return NextResponse.json({ message: "Thiếu ID sản phẩm" }, { status: 400 });
  }

  await prisma.product.delete({
    where: { id: body.id },
  });

  return NextResponse.json({ message: "Đã xóa sản phẩm" });
}