import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("PAYOS WEBHOOK:", body);

    const data = body.data || body;

    const orderCode = String(data.orderCode || "");
    const amount = Number(data.amount || 0);

    if (!orderCode || !amount) {
      return NextResponse.json({ success: false });
    }

    const deposit = await prisma.deposit.findFirst({
      where: {
        note: orderCode,
        status: "PENDING",
      },
    });

    if (!deposit) {
      return NextResponse.json({ success: true });
    }

    await prisma.$transaction([
      prisma.deposit.update({
        where: { id: deposit.id },
        data: { status: "PAID" },
      }),
      prisma.user.update({
        where: { id: deposit.userId },
        data: {
          balance: {
            increment: deposit.amount,
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}