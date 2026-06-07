import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

async function getUserFromToken(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const token = cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) return null;

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "shop_mmo_secret_123456"
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        role: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json(
        { message: "ID don hang khong hop le" },
        { status: 400 }
      );
    }

    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        { message: "Chua dang nhap" },
        { status: 401 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        OR: [
          { userId: user.id },
          ...(user.role === "ADMIN" ? [{}] : []),
        ],
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Khong tim thay don hang" },
        { status: 404 }
      );
    }

    // CHỈ lấy tài khoản của đúng đơn hàng này
    // Không lấy theo productId nữa
    const accounts = String(order.content || "")
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean);

    return NextResponse.json({
      order,
      accounts,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Loi lay chi tiet don hang",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}