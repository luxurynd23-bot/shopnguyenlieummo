import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.setting.findMany();

  const data: any = {};

  settings.forEach((s) => {
    data[s.key] = s.value;
  });

  return NextResponse.json({
    settings: {
      shopName: data.shopName || "SHOP MMO",
      shopDomain: data.shopDomain || "shopnguyenlieummo",
      warrantyText:
        data.warrantyText || "Bảo hành 6 giờ kể từ thời điểm giao tài khoản.",
      noticeText:
        data.noticeText ||
        "Sau khi mua, hệ thống tự động trừ số dư và giao tài khoản.",
      supportZalo: data.supportZalo || "",
      groupZalo: data.groupZalo || "",
    },
  });
}