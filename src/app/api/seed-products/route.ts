import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  await prisma.product.createMany({
    data: [
      {
        name: "TikTok Việt mã 71",
        price: 9000,
        stock: 10,
        content: "TK_TIKTOK_71_TEST|pass123",
      },
      {
        name: "TikTok Việt mã 65",
        price: 6000,
        stock: 10,
        content: "TK_TIKTOK_65_TEST|pass123",
      },
      {
        name: "Gmail đã tạo sẵn",
        price: 5000,
        stock: 10,
        content: "gmailtest@gmail.com|pass123",
      },
    ],
  });

  return NextResponse.json({ message: "Da tao san pham mau" });
}