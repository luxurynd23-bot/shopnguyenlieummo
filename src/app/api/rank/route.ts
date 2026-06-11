import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hideName(name: string) {
  if (!name) return "user********";
  if (name.length <= 3) return name + "******";
  return name.slice(0, 3) + "********";
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
        name: true,
        email: true,
        totalDeposit: true,
      },
    });

    const ranking = users
      .filter((u) => Number(u.totalDeposit || 0) > 0)
      .map((u, index) => ({
        rank: index + 1,
        name: hideName(u.name || u.email || "user"),
        amount: Number(u.totalDeposit || 0),
        trend: index % 3 === 0 ? "up" : "down",
      }));

    return NextResponse.json({ ranking });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Lỗi lấy bảng xếp hạng",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}