import { NextResponse } from "next/server";
import { PayOS } from "@payos/node";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID || "",
  apiKey: process.env.PAYOS_API_KEY || "",
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || "",
});

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

    const { amount } = await req.json();
    const money = Number(amount);

    if (!money || money < 10000) {
      return NextResponse.json(
        { message: "Số tiền tối thiểu là 10.000đ" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const orderCode = Number(String(Date.now()).slice(-10));

    await prisma.deposit.create({
      data: {
        userId: decoded.id,
        amount: money,
        note: String(orderCode),
        status: "PENDING",
      },
    });

    const paymentLink = await payos.paymentRequests.create({
      orderCode,
      amount: money,
      description: `NAP${orderCode}`,
      returnUrl: `${appUrl}/wallet`,
      cancelUrl: `${appUrl}/deposit`,
      items: [
        {
          name: "Nạp tiền vào ví",
          quantity: 1,
          price: money,
        },
      ],
    });

    return NextResponse.json({
      message: "Tạo thanh toán thành công",
      orderCode,
      checkoutUrl: paymentLink.checkoutUrl,
      paymentUrl: paymentLink.checkoutUrl,
      qrCode: paymentLink.qrCode,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Lỗi tạo thanh toán PayOS",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}