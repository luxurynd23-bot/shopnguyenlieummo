import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: any
) {
  try {
    const code = params?.code;

    if (!code) {
      return NextResponse.json([]);
    }

    const res = await fetch(
      `https://provinces.open-api.vn/api/p/${code}?depth=2`,
      { cache: "no-store" }
    );

    const data = await res.json();

    return NextResponse.json(data?.districts || []);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: true,
        message: error?.message || "Lỗi lấy quận huyện",
      },
      { status: 500 }
    );
  }
}