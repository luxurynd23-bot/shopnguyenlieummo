import { NextResponse } from "next/server";

const VUBEL_BASE_URL = "https://api.vubel.store";

export async function POST(req: Request) {
  try {
    const { session, count } = await req.json();

    if (!session) {
      return NextResponse.json(
        { message: "Thiếu session TikTok" },
        { status: 400 }
      );
    }

    const apiKey = process.env.VUBEL_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: "Thiếu VUBEL_API_KEY trong .env" },
        { status: 500 }
      );
    }

    const body = {
      session: session.startsWith("cookies=") ? session : `cookies=${session}`,
      count: Number(count) || 5,
    };

    const res = await fetch(`${VUBEL_BASE_URL}/v1/tiktok/detail`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        {
          message: "Vubel API lỗi",
          status: res.status,
          data,
        },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Lỗi server khi check TikTok",
        error: String(error),
      },
      { status: 500 }
    );
  }
}