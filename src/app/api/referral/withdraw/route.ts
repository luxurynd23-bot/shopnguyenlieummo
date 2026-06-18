import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { sendTelegram } from "@/lib/telegram";

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

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        referralBalance: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Không tìm thấy user" }, { status: 404 });
    }

    if ((user.referralBalance || 0) < 10000) {
      return NextResponse.json(
        { message: "Hoa hồng tối thiểu 10.000đ mới được rút" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: {
          increment: user.referralBalance,
        },
        referralBalance: 0,
      },
    });
await sendTelegram(`
🎁 <b>RÚT HOA HỒNG</b>

👤 User ID: ${user.id}
💰 Số tiền: ${user.referralBalance.toLocaleString("vi-VN")}đ
`);
    return NextResponse.json({
      message: "Đã chuyển hoa hồng vào số dư chính",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Lỗi rút hoa hồng",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}