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

  try {
    const items = await prisma.accountItem.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    const result = items.map((item: any) => ({
      ...item,
      productName: item.product?.name || "Không rõ",
    }));

    return NextResponse.json({ items: result });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Lỗi tải kho tài khoản",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
  }

  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ message: "Thiếu ID" }, { status: 400 });
    }

    await prisma.accountItem.delete({
      where: { id: body.id },
    });

    return NextResponse.json({ message: "Đã xóa tài khoản kho" });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Lỗi xóa tài khoản kho",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}