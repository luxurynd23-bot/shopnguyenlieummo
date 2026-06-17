import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const prisma = new PrismaClient();

const CHECK_COST = 500;

function getSessionHash(session: string) {
  return crypto.createHash("sha256").update(session.trim()).digest("hex");
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
    const { session, count, proxy } = await req.json();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Thiếu session TikTok" },
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

    const cleanSession = session.startsWith("cookies=")
      ? session
      : `cookies=${session}`;

    const sessionHash = getSessionHash(cleanSession);

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
        status: 200,
        cached: true,
        charged: false,
        message: "Cookie này đã check rồi, không trừ tiền",
        data: cached.raw,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, balance: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy user" },
        { status: 404 }
      );
    }

    if (user.balance < CHECK_COST) {
      return NextResponse.json(
        {
          success: false,
          message: `Số dư không đủ. Cần ${CHECK_COST.toLocaleString("vi-VN")}đ để check`,
          balance: user.balance,
        },
        { status: 402 }
      );
    }

    const apiKey = process.env.VUBEL_API_KEY;
    const baseUrl = process.env.VUBEL_BASE_URL || "https://api.vubel.store";
    const finalProxy = (proxy || process.env.VUBEL_DEFAULT_PROXY || "").trim();

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "Thiếu VUBEL_API_KEY" },
        { status: 500 }
      );
    }

    if (!finalProxy) {
      return NextResponse.json(
        { success: false, message: "Thiếu proxy mặc định" },
        { status: 400 }
      );
    }

    const res = await fetch(`${baseUrl}/v1/tiktok/detail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        session: cleanSession,
        count: Number(count) || 5,
        proxy: finalProxy,
      }),
    });

    const vubelData = await res.json().catch(() => null);
if (!res.ok || !vubelData?.ok) {
  return NextResponse.json({
    success: false,
    status: res.status,
    charged: false,
    message:
      vubelData?.message ||
      vubelData?.error ||
      "Check lỗi, không trừ tiền",
    data: vubelData,
  });
}
    const body = vubelData || {};
    const details =
      body?.data?.details ||
      body?.details ||
      body?.data?.orders ||
      body?.orders ||
      body?.items ||
      [];

    const firstOrder = Array.isArray(details) ? details[0] : null;
    const order = firstOrder?.order || {};
    const detail = firstOrder?.detail || {};
    const product = detail?.products?.[0] || order?.products?.[0] || {};

    await prisma.$transaction([
  prisma.user.update({
    where: { id: userId },
    data: {
      balance: {
        decrement: CHECK_COST,
      },
    },
  }),

  prisma.walletHistory.create({
    data: {
      userId,
      type: "CHECK_MVD",
      amount: -CHECK_COST,
      note: `Check MVD TikTok - ${detail?.tracking || "Không có mã vận đơn"}`,
    },
  }),

  prisma.tiktokCheckHistory.create({
        data: {
          userId,
          sessionHash,
          cost: CHECK_COST,
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
          raw: vubelData,
        },
      }),
    ]);

    return NextResponse.json({
      success: res.ok,
      status: res.status,
      cached: false,
      charged: true,
      cost: CHECK_COST,
      data: vubelData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi check Pé Đào",
        error: String(error),
      },
      { status: 500 }
    );
  }
}