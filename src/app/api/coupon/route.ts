import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();

    if (!code) {
      return NextResponse.json(
        { message: "Thiếu mã giảm giá" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.active) {
      return NextResponse.json(
        { message: "Mã giảm giá không hợp lệ" },
        { status: 400 }
      );
    }

    return NextResponse.json({ coupon });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Lỗi kiểm tra coupon",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}