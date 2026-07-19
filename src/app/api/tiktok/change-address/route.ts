import { NextRequest, NextResponse } from "next/server";

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
      new_address_id,
    } = body;

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
        }
      : {
          cookie,
          auto_create_address: false,
          new_address_id,
        };

    const res = await fetch(
      "https://botlc.pro/tiktok/change-address",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.BOTLC_API_KEY!,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      { status: 500 }
    );
  }
}