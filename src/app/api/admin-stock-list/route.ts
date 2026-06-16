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

  const result = await Promise.all(
    products.map(async (p) => {
      const total = await prisma.accountItem.count({
        where: { productId: p.id },
      });

      const unsold = await prisma.accountItem.count({
        where: {
          productId: p.id,
          sold: false,
        },
      });

      const sold = await prisma.accountItem.count({
        where: {
          productId: p.id,
          sold: true,
        },
      });

      return {
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        total,
        unsold,
        sold,
      };
    })
  );

  return NextResponse.json({ products: result });
}