import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const res = await fetch(
      `https://provinces.open-api.vn/api/v2/p/${code}?depth=2`,
      { cache: "no-store" }
    );

    const data = await res.json();

    const wards =
      data?.wards?.map((w: any) => ({
        ...w,
        label: w.name,
      })) || [];

    return NextResponse.json(wards);
  } catch {
    return NextResponse.json([]);
  }
}