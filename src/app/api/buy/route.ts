import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { sendTelegram } from "@/lib/telegram";

function getVipDiscount(vipLevel: string) {
  if (vipLevel === "DIAMOND") return 10;
  if (vipLevel === "GOLD") return 5;
  if (vipLevel === "SILVER") return 3;
  return 0;
}

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const token = cookie
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "shop_mmo_secret_123456"
    );

    const { productId, quantity, couponCode } = await req.json();
    const qty = Number(quantity) || 1;

    if (!productId) {
      return NextResponse.json({ message: "Thiếu sản phẩm" }, { status: 400 });
    }

    if (qty <= 0 || qty > 100) {
      return NextResponse.json(
        { message: "Số lượng không hợp lệ" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) throw new Error("Sản phẩm không tồn tại");

      const user = await tx.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) throw new Error("Tài khoản không tồn tại");
      if (user.isBanned) throw new Error("Tài khoản đã bị khóa");

      const accounts = await tx.accountItem.findMany({
        where: {
          productId: product.id,
          sold: false,
          orderId: null,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: qty,
      });

      if (accounts.length < qty) {
        throw new Error("Hết hàng trong kho");
      }

      const subtotal = product.price * qty;

      let couponDiscount = 0;
      let couponName = "";
      let couponText = "";

      if (couponCode) {
        const code = String(couponCode).trim().toUpperCase();

        const coupon = await tx.coupon.findUnique({
          where: { code },
        });

        if (!coupon || !coupon.active) {
          throw new Error("Mã giảm giá không hợp lệ");
        }

        couponName = coupon.code;

        if (coupon.type === "PERCENT") {
          couponDiscount = Math.floor((subtotal * coupon.value) / 100);
        } else {
          couponDiscount = coupon.value;
        }

        couponDiscount = Math.max(0, Math.min(couponDiscount, subtotal));
      }

      const vipPercent = getVipDiscount((user as any).vipLevel || "BRONZE");

      const vipDiscount = Math.max(
        0,
        Math.min(Math.floor((subtotal * vipPercent) / 100), subtotal)
      );

      const totalDiscount = Math.min(subtotal, couponDiscount + vipDiscount);
      const finalTotal = Math.max(subtotal - totalDiscount, 0);

      if (user.balance < finalTotal) {
        throw new Error("Số dư không đủ");
      }

      if (couponName) {
        couponText += `Mã giảm giá: ${couponName}`;
        couponText += `\nGiảm coupon: ${couponDiscount.toLocaleString("vi-VN")}đ`;
      }

      if (vipPercent > 0) {
        couponText += `${couponText ? "\n" : ""}VIP: ${(user as any).vipLevel}`;
        couponText += `\nGiảm VIP ${vipPercent}%: ${vipDiscount.toLocaleString("vi-VN")}đ`;
      }

      couponText += `${couponText ? "\n" : ""}Tổng trước giảm: ${subtotal.toLocaleString("vi-VN")}đ`;
      couponText += `\nThanh toán: ${finalTotal.toLocaleString("vi-VN")}đ`;

      const createdOrder = await tx.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          productName: product.name,
          amount: finalTotal,
          content: couponText,
        },
      });

      const updateItems = await tx.accountItem.updateMany({
        where: {
          id: {
            in: accounts.map((a) => a.id),
          },
          sold: false,
          orderId: null,
        },
        data: {
          sold: true,
          soldAt: new Date(),
          orderId: createdOrder.id,
        },
      });

      if (updateItems.count !== qty) {
        throw new Error("Có người vừa mua trước, vui lòng thử lại");
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          balance: {
            decrement: finalTotal,
          },
        },
      });

      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: {
            decrement: qty,
          },
        },
      });

      await tx.walletHistory.create({
        data: {
          userId: user.id,
          type: "BUY",
          amount: finalTotal,
          note: `Mua ${qty} ${product.name}`,
        },
      });

      if (couponName && couponDiscount > 0) {
        await tx.couponUsage.create({
          data: {
            userId: user.id,
            couponCode: couponName,
            discount: couponDiscount,
            orderId: createdOrder.id,
          },
        });
      }

      return {
  order: createdOrder,
  product,
  userEmail: user.email,
  qty,
  accounts,
  subtotal,
        couponDiscount,
        vipDiscount,
        vipPercent,
        totalDiscount,
        total: finalTotal,
      };
    });
await sendTelegram(`
🛒 <b>ĐƠN HÀNG MỚI</b>

👤 User: ${result.userEmail}
📦 Sản phẩm: ${result.product.name}
🔢 Số lượng: ${result.qty}
💰 Thanh toán: ${result.total.toLocaleString("vi-VN")}đ
🧾 Order ID: ${result.order.id}
`);
    return NextResponse.json({
      message: `Mua thành công ${qty} tài khoản`,
      orderId: result.order.id,
      product: result.product.name,
      accounts: result.accounts.map((a) => a.content),
      subtotal: result.subtotal,
      couponDiscount: result.couponDiscount,
      vipDiscount: result.vipDiscount,
      vipPercent: result.vipPercent,
      totalDiscount: result.totalDiscount,
      total: result.total,
    });
  } catch (error: any) {

  await sendTelegram(`
🚨 <b>LỖI MUA HÀNG</b>

❌ ${error?.message || String(error)}
  `);

  return NextResponse.json(
      {
        message: error?.message || "Lỗi mua hàng",
      },
      { status: 400 }
    );
  }
}