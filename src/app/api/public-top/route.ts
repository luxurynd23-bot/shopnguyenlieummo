import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function maskName(text: string) {
  if (!text) return "...user";
  const clean = String(text).split("@")[0];
  if (clean.length <= 3) return "..." + clean;
  return "..." + clean.slice(-3);
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        totalDeposit: "desc",
      },
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
        totalDeposit: true,
      },
    });

    return NextResponse.json({
      topDeposits: users.map((u) => ({
        id: u.id,
        user: maskName(u.name || u.email),
        totalDeposit: u.totalDeposit || 0,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Lỗi top nạp",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}