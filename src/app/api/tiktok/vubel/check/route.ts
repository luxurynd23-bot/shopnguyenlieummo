import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendTelegram } from "@/lib/telegram";

const prisma = new PrismaClient();
const CHECK_COST = 500;
const VUBEL_COST = 300;
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
const lastCheck = await prisma.tiktokCheckHistory.findFirst({
  where: {
    userId,
  },
  orderBy: {
    createdAt: "desc",
  },
});

if (
  lastCheck &&
  Date.now() - new Date(lastCheck.createdAt).getTime() < 2000
) {
  return NextResponse.json(
    {
      success: false,
      message: "Vui lòng chờ 2 giây rồi check tiếp",
    },
    { status: 429 }
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

    if (
  user.role !== "ADMIN" &&
  user.balance < CHECK_COST
) {
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
    const hasResult =
  !!detail?.orderId ||
  !!order?.orderId ||
  !!detail?.tracking;
    const product = detail?.products?.[0] || order?.products?.[0] || {};
if (!hasResult) {
  return NextResponse.json({
    success: true,
    charged: false,
    cached: false,
    message: "Cookie không có đơn hàng, không trừ tiền",
    data: vubelData,
  });
}
    const doubleCheck = await prisma.tiktokCheckHistory.findUnique({
      where: {
        userId_sessionHash: {
          userId,
          sessionHash,
        },
      },
    });

    if (doubleCheck) {
      return NextResponse.json({
        success: true,
        status: 200,
        cached: true,
        charged: false,
        message: "Cookie này đã được check bởi request khác, không trừ tiền",
        data: doubleCheck.raw,
      });
    }

    try {
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
      {
        success: false,
        message: "Số dư không đủ",
      },
      { status: 402 }
    );
  }

  tx.push(
    prisma.walletHistory.create({
      data: {
        userId,
        type: "CHECK_MVD",
        amount: -CHECK_COST,
        note: `Check MVD TikTok - ${
          detail?.tracking || "Không có mã vận đơn"
        }`,
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
apiCost: VUBEL_COST,
profit: user.role === "ADMIN" ? -VUBEL_COST : CHECK_COST - VUBEL_COST,
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
    })
  );

    await prisma.$transaction(tx);
    await sendTelegram(`
📦 <b>CHECK MVD</b>

👤 User ID: ${userId}
🚚 MVD: ${detail?.tracking || "Không có"}
🏪 Shop: ${detail?.shop || order?.shop || "Không có"}
💰 Thu: ${
  user.role === "ADMIN"
    ? "Admin miễn phí"
    : CHECK_COST.toLocaleString("vi-VN") + "đ"
}
`);
} catch (err: any) {
  const cachedAfterError = await prisma.tiktokCheckHistory.findUnique({
    where: {
      userId_sessionHash: {
        userId,
        sessionHash,
      },
    },
  });
  if (cachedAfterError) {
    return NextResponse.json({
      success: true,
      status: 200,
      cached: true,
      charged: false,
      message: "Cookie này đã check rồi, không trừ thêm tiền",
      data: cachedAfterError.raw,
    });
  }

  throw err;
}

return NextResponse.json({
  success: res.ok,
  status: res.status,
  cached: false,
  charged: user.role !== "ADMIN",
  cost: user.role === "ADMIN" ? 0 : CHECK_COST,
  data: vubelData,
});
  } catch (error: any) {
  await sendTelegram(`
🚨 <b>LỖI CHECK MVD</b>

❌ ${error?.message || String(error)}
`);

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