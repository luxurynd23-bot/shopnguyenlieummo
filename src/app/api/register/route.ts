import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existed = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existed) {
      return NextResponse.json(
        { message: "Email đã tồn tại" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name || null,
        balance: 0,
      },
    });

    return NextResponse.json({
      message: "Đăng ký thành công",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        balance: user.balance,
      },
    });
  } catch (error: any) {
    console.error("REGISTER_ERROR:", error);

    return NextResponse.json(
      {
        message: "Lỗi đăng ký",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}