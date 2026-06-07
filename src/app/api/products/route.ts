import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  const result = await Promise.all(
    products.map(async (p) => {
      const unsold = await prisma.accountItem.count({
        where: {
          productId: p.id,
          sold: false,
        },
      });

      return {
        ...p,
        stock: unsold,
      };
    })
  );

  return NextResponse.json({ products: result });
}