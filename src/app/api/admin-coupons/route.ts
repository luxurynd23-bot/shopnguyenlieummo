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

export async function GET(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({
    coupons,
  });
}

export async function POST(req: Request) {
  try {
    if (!(await checkAdmin(req))) {
      return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
    }

    const body = await req.json();

    const code = String(body.code || "").trim().toUpperCase();
    const type = String(body.type || "").trim().toUpperCase();
    const value = Number(body.value);

    if (!code) {
      return NextResponse.json({ message: "Thiếu mã coupon" }, { status: 400 });
    }

    if (!["PERCENT", "FIXED"].includes(type)) {
      return NextResponse.json(
        { message: "Loại coupon không hợp lệ" },
        { status: 400 }
      );
    }

    if (!value || value <= 0) {
      return NextResponse.json(
        { message: "Giá trị coupon không hợp lệ" },
        { status: 400 }
      );
    }

    if (type === "PERCENT" && value > 100) {
      return NextResponse.json(
        { message: "Coupon phần trăm không được vượt quá 100%" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        type,
        value,
        active: true,
      },
    });

    return NextResponse.json({
      message: "Tạo coupon thành công",
      coupon,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message:
          error?.code === "P2002"
            ? "Mã coupon đã tồn tại"
            : error?.message || "Lỗi tạo coupon",
      },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await checkAdmin(req))) {
      return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
    }

    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ message: "Thiếu id coupon" }, { status: 400 });
    }

    const coupon = await prisma.coupon.update({
      where: {
        id: body.id,
      },
      data: {
        active: Boolean(body.active),
      },
    });

    return NextResponse.json({
      message: "Đã cập nhật coupon",
      coupon,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Lỗi cập nhật coupon",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await checkAdmin(req))) {
      return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
    }

    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ message: "Thiếu id coupon" }, { status: 400 });
    }

    await prisma.coupon.delete({
      where: {
        id: body.id,
      },
    });

    return NextResponse.json({
      message: "Đã xóa coupon",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Lỗi xóa coupon",
      },
      { status: 400 }
    );
  }
}