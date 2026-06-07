import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  const deposit = await prisma.deposit.findFirst({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  if (!deposit) {
    return NextResponse.json({ message: "Khong co don PENDING" });
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

  return NextResponse.json({
    message: "Da cong tien",
    amount: deposit.amount,
  });
}