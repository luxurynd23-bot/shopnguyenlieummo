import { NextResponse } from "next/server";
import { sendTelegram } from "@/lib/telegram";

export async function GET() {
  await sendTelegram("🚀 Test Telegram thành công");

  return NextResponse.json({
    success: true,
  });
}