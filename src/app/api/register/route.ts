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
        { message: "Email da ton tai" },
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
      message: "Dang ky thanh cong",
      user: {
        email: user.email,
        name: user.name,
        balance: user.balance,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Loi dang ky" },
      { status: 500 }
    );
  }
}