import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { session, count, proxy } = await req.json();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Thiếu session TikTok" },
        { status: 400 }
      );
    }

    const apiKey = process.env.VUBEL_API_KEY;
    const baseUrl = process.env.VUBEL_BASE_URL || "https://api.vubel.store";

    const finalProxy = (proxy || process.env.VUBEL_DEFAULT_PROXY || "").trim();

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "Thiếu VUBEL_API_KEY" },
        { status: 500 }
      );
    }

    if (!finalProxy) {
      return NextResponse.json(
        { success: false, message: "Thiếu proxy mặc định" },
        { status: 400 }
      );
    }
    console.log("FINAL_PROXY =", finalProxy);
    const res = await fetch(`${baseUrl}/v1/tiktok/detail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
  session: session.startsWith("cookies=") ? session : `cookies=${session}`,
  count: Number(count) || 5,
  proxy: finalProxy,
}),
    });

    const data = await res.json().catch(() => null);

    return NextResponse.json({
      success: res.ok,
      status: res.status,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi check Vubel",
        error: String(error),
      },
      { status: 500 }
    );
  }
}