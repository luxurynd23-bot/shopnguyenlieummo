import { NextResponse } from "next/server";
import addressData from "../../../data/vietnam-address-database.json";

export async function GET() {
  try {
    const provincesTable = (addressData as any[]).find(
      (item) => item.type === "table" && item.name === "provinces"
    );

    const provinces =
      provincesTable?.data?.map((p: any) => ({
        value: String(p.province_code),
        code: String(p.province_code),
        name: p.name,
        label: p.name,
        short_name: p.short_name,
        place_type: p.place_type,
      })) || [];

    return NextResponse.json(provinces);
  } catch {
    return NextResponse.json([]);
  }
}
