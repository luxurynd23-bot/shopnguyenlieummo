import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

async function checkAdmin(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const token = cookie.split("; ").find((c) => c.startsWith("token="))?.split("=")[1];
  if (!token) return false;

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "shop_mmo_secret_123456");

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

  const items = await prisma.accountItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  const products = await prisma.product.findMany();

  const result = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);

    return {
      ...item,
      productName: product?.name || "Không rõ",
    };
  });

  return NextResponse.json({ items: result });
}

export async function DELETE(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ message: "Khong co quyen" }, { status: 403 });
  }

  const body = await req.json();

  await prisma.accountItem.delete({
    where: { id: body.id },
  });

  return NextResponse.json({ message: "Da xoa tai khoan kho" });
}