import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            accountItems: {
              where: {
                sold: false,
              },
            },
          },
        },
      },
    });

    const result = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      content: p.content,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      stock: p._count.accountItems,
    }));

    return NextResponse.json({
      products: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Lỗi tải sản phẩm",
        error: error?.message,
      },
      { status: 500 }
    );
  }
}