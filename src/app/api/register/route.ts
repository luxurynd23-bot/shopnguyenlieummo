import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendTelegram } from "@/lib/telegram";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  name: z.string().max(100, "Tên quá dài").optional(),
  referralCode: z.string().optional(),
});

function makeReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createUniqueReferralCode() {
  for (let i = 0; i < 20; i++) {
    const code = makeReferralCode();

    const existed = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });

    if (!existed) return code;
  }

  return `REF${Date.now().toString().slice(-8)}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const email = data.email.toLowerCase().trim();
    const name = String(data.name || "").trim();
    const inputReferralCode = String(data.referralCode || "")
      .trim()
      .toUpperCase();

    const existed = await prisma.user.findUnique({
      where: { email },
    });

    if (existed) {
      return NextResponse.json(
        { message: "Email đã tồn tại" },
        { status: 400 }
      );
    }

    let referredBy: string | null = null;

    if (inputReferralCode) {
      const refUser = await prisma.user.findUnique({
        where: { referralCode: inputReferralCode },
        select: { id: true },
      });

      if (!refUser) {
        return NextResponse.json(
          { message: "Mã giới thiệu không hợp lệ" },
          { status: 400 }
        );
      }

      referredBy = inputReferralCode;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const newReferralCode = await createUniqueReferralCode();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        referralCode: newReferralCode,
        referredBy,
        balance: 0,
        totalDeposit: 0,
        role: "USER",
      },
    });
await sendTelegram(`
🆕 <b>USER MỚI ĐĂNG KÝ</b>

📧 Email: ${user.email}
👤 Tên: ${user.name || "Không có"}
🆔 User ID: ${user.id}
`);
    return NextResponse.json({
      message: "Đăng ký thành công",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        balance: user.balance,
        totalDeposit: user.totalDeposit,
        role: user.role,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
      },
    });
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json(
        { message: error.issues[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Lỗi đăng ký",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}