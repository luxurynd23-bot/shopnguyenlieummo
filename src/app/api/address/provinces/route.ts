import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://provinces.open-api.vn/api/v2/p/", {
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}