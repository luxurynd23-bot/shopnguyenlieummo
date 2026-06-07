import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const token = cookie
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ message: "Chua dang nhap" }, { status: 401 });
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "shop_mmo_secret_123456"
    );

    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { message: "Mat khau moi toi thieu 6 ky tu" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return NextResponse.json({ message: "Khong tim thay user" }, { status: 404 });
    }

    const ok = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!ok) {
      return NextResponse.json({ message: "Mat khau cu khong dung" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ message: "Doi mat khau thanh cong" });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Loi doi mat khau", error: error?.message || String(error) },
      { status: 500 }
    );
  }
}