import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const token = cookie
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "shop_mmo_secret_123456"
    );

    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ message: "Thiếu mật khẩu" }, { status: 400 });
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { message: "Mật khẩu mới tối thiểu 6 ký tự" },
        { status: 400 }
      );
    }

    if (oldPassword === newPassword) {
      return NextResponse.json(
        { message: "Mật khẩu mới phải khác mật khẩu cũ" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Không tìm thấy user" },
        { status: 404 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { message: "Tài khoản đã bị khóa" },
        { status: 403 }
      );
    }

    const ok = await bcrypt.compare(String(oldPassword), user.passwordHash);

    if (!ok) {
      return NextResponse.json(
        { message: "Mật khẩu cũ không đúng" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(String(newPassword), 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      message: "Đổi mật khẩu thành công",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Lỗi đổi mật khẩu",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}