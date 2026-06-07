import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PayOS } from "@payos/node";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const payOS = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID!,
  apiKey: process.env.PAYOS_API_KEY!,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
});

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

    const { amount } = await req.json();
    const money = Number(amount);

    if (!money || money < 10000) {
      return NextResponse.json(
        { message: "So tien toi thieu la 10000d" },
        { status: 400 }
      );
    }

    const orderCode = Number(String(Date.now()).slice(-10));

    // Tạo đơn nạp trong DB
    await prisma.deposit.create({
      data: {
        userId: decoded.id,
        amount: money,
        note: String(orderCode),
        status: "PENDING",
      },
    });

    // Tạo payment link
    const paymentLink = await payOS.paymentRequests.create({
      orderCode,
      amount: money,
      description: "Nap tien MMO",
      returnUrl: `${process.env.NEXT_PUBLIC_URL}/wallet`,
      cancelUrl: `${process.env.NEXT_PUBLIC_URL}/deposit`,
    });

    return NextResponse.json({ checkoutUrl: paymentLink.checkoutUrl });
  } catch (error: any) {
    console.error("PAYOS ERROR:", error);
    return NextResponse.json(
      { message: "Loi PayOS", error: error?.message || String(error) },
      { status: 500 }
    );
  }
}