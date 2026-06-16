import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const cleanEmail = String(email || "").toLowerCase().trim();
    const cleanPassword = String(password || "");

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { message: "Vui lòng nhập email và mật khẩu" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: cleanEmail,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Sai email hoặc mật khẩu" },
        { status: 400 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { message: "Tài khoản đã bị khóa" },
        { status: 403 }
      );
    }

    const ok = await bcrypt.compare(cleanPassword, user.passwordHash);

    if (!ok) {
      return NextResponse.json(
        { message: "Sai email hoặc mật khẩu" },
        { status: 400 }
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "shop_mmo_secret_123456",
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        balance: user.balance,
        totalDeposit: user.totalDeposit,
        role: user.role,
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { message: "Lỗi đăng nhập", error: error?.message },
      { status: 500 }
    );
  }
}