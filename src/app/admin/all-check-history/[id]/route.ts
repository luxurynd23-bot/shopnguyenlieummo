import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

async function getAdmin(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const token = cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) return null;

  const decoded: any = jwt.verify(
    token,
    process.env.JWT_SECRET || "shop_mmo_secret_123456"
  );

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "ADMIN") return null;

  return user;
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdmin(req);

    if (!admin) {
      return NextResponse.json(
        { message: "Không có quyền admin" },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    await prisma.tiktokCheckHistory.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa lịch sử check",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Lỗi xóa lịch sử",
      },
      { status: 500 }
    );
  }
}