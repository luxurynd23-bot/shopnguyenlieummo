import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendTelegram } from "@/lib/telegram";

const CHECK_COST = 200;
const BAMBOO_COST = 0;

function getHash(text: string) {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

function getUserIdFromCookie(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const token = cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) return null;

  const decoded: any = jwt.verify(
    token,
    process.env.JWT_SECRET || "shop_mmo_secret_123456"
  );

  return decoded.id || decoded.userId || null;
}

export async function POST(req: Request) {
  try {
    const { session } = await req.json();

    const username = String(session || "")
      .trim()
      .replace(/^@/, "");

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Thiếu username TikTok" },
        { status: 400 }
      );
    }

    const userId = getUserIdFromCookie(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Bạn cần đăng nhập để check" },
        { status: 401 }
      );
    }

    const sessionHash = getHash(username);

    const cached = await prisma.tiktokCheckHistory.findUnique({
      where: {
        userId_sessionHash: {
          userId,
          sessionHash,
        },
      },
    });

    if (cached) {
      return NextResponse.json({
        success: true,
        cached: true,
        charged: false,
        message: "Username này đã check rồi, không trừ tiền",
        data: cached.raw,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        balance: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy user" },
        { status: 404 }
      );
    }

    if (user.role !== "ADMIN" && user.balance < CHECK_COST) {
      return NextResponse.json(
        {
          success: false,
          message: `Số dư không đủ. Cần ${CHECK_COST.toLocaleString(
            "vi-VN"
          )}đ để check`,
          balance: user.balance,
        },
        { status: 402 }
      );
    }

    const res = await fetch("https://bambootik.top/check.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usernames: [username],
      }),
    });

    const bambooData = await res.json().catch(() => null);

    if (!res.ok || !bambooData?.status) {
      return NextResponse.json({
        success: false,
        status: res.status,
        charged: false,
        message: bambooData?.message || bambooData?.msg || "Check lỗi, không trừ tiền",
        data: bambooData,
      });
    }

    const first = bambooData?.data?.[0];
    const info = first?.data || {};

    const hasResult = !!first?.status && !!info?.orderId && !!info?.tracking;

    const mappedData = {
      ok: true,
      data: {
        details: hasResult
          ? [
              {
                order: {
                  orderId: info.orderId || "",
                  status: info.statusShip || info.status || "",
                  total: info.totalPrice
                    ? `${Number(info.totalPrice).toLocaleString("vi-VN")}đ`
                    : "",
                  shop: "",
                  products: [
                    {
                      name: info.productName || "",
                    },
                  ],
                },
                detail: {
                  orderId: info.orderId || "",
                  tracking: info.tracking || "",
                  status: info.statusShip || info.status || "",
                  shop: "",
                  total: info.totalPrice
                    ? `${Number(info.totalPrice).toLocaleString("vi-VN")}đ`
                    : "",
                  carrierName: "BambooTik",
                  shipperName: info.nameShip || "",
                  shipperPhone: info.phoneShip || "",
                  shippingState: info.statusShip || "",
                  shippingNote: info.descriptionShip || "",
                  paymentMethod: "",
                  createdAt: info.timeCreate || "",
                  deliveredAt: "",
                  address: {
                    name: info.name || "",
                    phone: info.phone || "",
                    fullAddress: info.address || "",
                  },
                  products: [
                    {
                      name: info.productName || "",
                      qty: 1,
                      price: info.totalPrice
                        ? `${Number(info.totalPrice).toLocaleString("vi-VN")}đ`
                        : "",
                    },
                  ],
                },
              },
            ]
          : [],
      },
      raw: bambooData,
    };

    const firstMapped: any = mappedData.data.details[0] || {};
const detail: any = firstMapped.detail || {};
const order: any = firstMapped.order || {};
const product: any = detail.products?.[0] || order.products?.[0] || {};

    if (!hasResult) {
      await prisma.tiktokCheckHistory.create({
        data: {
          userId,
          sessionHash,
          cost: 0,
          apiCost: BAMBOO_COST,
          profit: 0,
          status: "Không có đơn hàng",
          orderId: "",
          trackingNo: "",
          shopName: "",
          product: "",
          total: "",
          carrierName: "",
          shipperName: "",
          shipperPhone: "",
          phone: "",
          address: "",
          raw: mappedData,
        },
      });

      return NextResponse.json({
        success: true,
        cached: false,
        charged: false,
        message: "Username không có đơn hàng, không trừ tiền",
        data: mappedData,
      });
    }

    const tx: any[] = [];

    if (user.role !== "ADMIN") {
      const updatedBalance = await prisma.user.updateMany({
        where: {
          id: userId,
          balance: {
            gte: CHECK_COST,
          },
        },
        data: {
          balance: {
            decrement: CHECK_COST,
          },
        },
      });

      if (updatedBalance.count === 0) {
        return NextResponse.json(
          { success: false, message: "Số dư không đủ" },
          { status: 402 }
        );
      }

      tx.push(
        prisma.walletHistory.create({
          data: {
            userId,
            type: "CHECK_MVD",
            amount: -CHECK_COST,
            note: `Check MVD TikTok - ${detail?.tracking || username}`,
          },
        })
      );
    }

    tx.push(
      prisma.tiktokCheckHistory.create({
        data: {
          userId,
          sessionHash,
          cost: user.role === "ADMIN" ? 0 : CHECK_COST,
          apiCost: BAMBOO_COST,
          profit: user.role === "ADMIN" ? 0 : CHECK_COST - BAMBOO_COST,
          status: detail?.status || order?.status || "",
          orderId: detail?.orderId || order?.orderId || "",
          trackingNo: detail?.tracking || "",
          shopName: detail?.shop || order?.shop || "",
          product: product?.name || "",
          total: detail?.total || order?.total || "",
          carrierName: detail?.carrierName || "",
          shipperName: detail?.shipperName || "",
          shipperPhone: detail?.shipperPhone || "",
          phone: detail?.address?.phone || "",
          address: detail?.address?.fullAddress || "",
          raw: mappedData,
        },
      })
    );

    await prisma.$transaction(tx);

    await sendTelegram(`
📦 <b>CHECK MVD BAMBOO</b>

👤 User ID: ${userId}
👤 Username: ${username}
🚚 MVD: ${detail?.tracking || "Không có"}
💰 Thu: ${
      user.role === "ADMIN"
        ? "Admin miễn phí"
        : CHECK_COST.toLocaleString("vi-VN") + "đ"
    }
`);

    return NextResponse.json({
      success: true,
      status: res.status,
      cached: false,
      charged: user.role !== "ADMIN",
      cost: user.role === "ADMIN" ? 0 : CHECK_COST,
      data: mappedData,
    });
  } catch (error: any) {
    await sendTelegram(`
🚨 <b>LỖI CHECK MVD BAMBOO</b>

❌ ${error?.message || String(error)}
`);

    return NextResponse.json(
      {
        success: false,
        message: "Lỗi check MVD Bamboo",
        error: String(error),
      },
      { status: 500 }
    );
  }
}