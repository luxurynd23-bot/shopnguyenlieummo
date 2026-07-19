import { NextResponse } from "next/server";
import addressData from "../../../../data/vietnam-address-database.json";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const wardsTable = (addressData as any[]).find(
      (item) => item.type === "table" && item.name === "wards"
    );

    const wards =
      wardsTable?.data
        ?.filter((w: any) => String(w.province_code) === String(code))
        ?.map((w: any) => ({
          value: String(w.ward_code),
          code: String(w.ward_code),
          name: w.name,
          label: w.name,
          province_code: String(w.province_code),
        })) || [];

    return NextResponse.json(wards);
  } catch {
    return NextResponse.json([]);
  }
}
