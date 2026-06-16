import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const topDeposit = await prisma.user.findMany({
    orderBy: {
      totalDeposit: "desc",
    },
    take: 20,
    select: {
      id: true,
      email: true,
      totalDeposit: true,
      vipLevel: true,
    },
  });

  const topReferral = await prisma.user.findMany({
    orderBy: {
      referralBalance: "desc",
    },
    take: 20,
    select: {
      id: true,
      email: true,
      referralBalance: true,
      vipLevel: true,
    },
  });

  return NextResponse.json({
    topDeposit,
    topReferral,
  });
}