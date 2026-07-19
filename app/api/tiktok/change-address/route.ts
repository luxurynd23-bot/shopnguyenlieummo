import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      cookie,
      auto_create_address,
      name,
      phone,
      province,
      district,
      ward,
      address,
      detail_address,
      province_code,
      ward_code,
      new_address_id,
    } = body;

    if (!cookie) {
      return NextResponse.json(
        { success: false, message: "Thiếu Session TikTok" },
        { status: 400 }
      );
    }

    if (auto_create_address) {
      if (!name || !phone || !province || !ward || !address) {
        return NextResponse.json(
          {
            success: false,
            message: "Thiếu tên, số điện thoại, tỉnh/thành, phường/xã hoặc địa chỉ",
          },
          { status: 400 }
        );
      }
    } else {
      if (!new_address_id) {
        return NextResponse.json(
          { success: false, message: "Thiếu new_address_id" },
          { status: 400 }
        );
      }
    }

    const payload = auto_create_address
      ? {
          cookie,
          auto_create_address: true,
          name,
          phone,
          province,
          district,
          ward,
          address,
          detail_address,
          province_code,
          ward_code,
        }
      : {
          cookie,
          auto_create_address: false,
          new_address_id,
        };

    const res = await fetch("https://botlc.pro/tiktok/change-address", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.BOTLC_API_KEY || "",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    return NextResponse.json({
      success: res.ok,
      status: res.status,
      data,
      message: data?.message || data?.error || "",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err?.message || "Lỗi server",
      },
      { status: 500 }
    );
  }
}
