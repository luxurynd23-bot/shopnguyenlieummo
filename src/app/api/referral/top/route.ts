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
      where: {
        referralCode: {
          not: null,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        referralCode: true,
      },
    });

    const allUsers = await prisma.user.findMany({
      select: {
        referredBy: true,
      },
    });

    const result = users
      .map((u) => {
        const count = allUsers.filter(
          (x) => x.referredBy === u.referralCode
        ).length;

        return {
          id: u.id,
          user: maskName(u.name || u.email),
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      topReferrals: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Lỗi top giới thiệu",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}