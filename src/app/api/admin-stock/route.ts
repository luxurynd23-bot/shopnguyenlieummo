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

export async function POST(req: Request) {
  try {
    if (!(await checkAdmin(req))) {
      return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
    }

    const body = await req.json();

    const productId = String(body.productId || "");
    const content = String(body.content || "");

    if (!productId) {
      return NextResponse.json(
        { message: "Thiếu sản phẩm" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    const lines = content
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      return NextResponse.json(
        { message: "Không có dữ liệu" },
        { status: 400 }
      );
    }

    const uniqueLines = Array.from(new Set(lines));

    await prisma.$transaction([
      prisma.accountItem.createMany({
        data: uniqueLines.map((line) => ({
          productId,
          content: line,
        })),
      }),

      prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            increment: uniqueLines.length,
          },
        },
      }),
    ]);

    return NextResponse.json({
      message: `Đã nhập ${uniqueLines.length} tài khoản`,
      count: uniqueLines.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Lỗi nhập kho",
      },
      { status: 500 }
    );
  }
}