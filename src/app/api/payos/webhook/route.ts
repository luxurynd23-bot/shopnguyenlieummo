import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Xử lý webhook PayOS ở đây
    console.log("Webhook PayOS:", body);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { message: "Lỗi webhook", error: error?.message || String(error) },
      { status: 500 }
    );
  }
}