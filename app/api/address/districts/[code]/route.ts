import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const res = await fetch(
      `https://provinces.open-api.vn/api/p/${code}?depth=2`,
      { cache: "no-store" }
    );

    const data = await res.json();

    return NextResponse.json(data.districts || []);
  } catch {
    return NextResponse.json([]);
  }
}