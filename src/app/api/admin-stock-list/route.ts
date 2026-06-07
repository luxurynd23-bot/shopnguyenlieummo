import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
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