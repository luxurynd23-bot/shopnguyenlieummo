import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

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

    const { productId, quantity } = await req.json();
    const qty = Number(quantity) || 1;

    if (qty <= 0) {
      return NextResponse.json({ message: "Số lượng không hợp lệ" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ message: "Sản phẩm không tồn tại" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.balance < product.price * qty) {
      return NextResponse.json({ message: "Số dư không đủ" }, { status: 400 });
    }

    // Lấy các account chưa bán đủ số lượng
    const accounts = await prisma.accountItem.findMany({
      where: { productId: product.id, sold: false },
      orderBy: { createdAt: "asc" },
      take: qty,
    });

    if (accounts.length < qty) {
      return NextResponse.json({ message: "Hết hàng trong kho" }, { status: 400 });
    }

    const order = await prisma.$transaction(async (tx) => {
      // Trừ tiền user
      await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: product.price * qty } },
      });

      // Tạo đơn hàng
      const createdOrder = await tx.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          product: product.name,
          amount: product.price * qty,
          content: accounts.map((a) => a.content).join("\n"),
        },
      });

      // Cập nhật account đã bán
      await Promise.all(
        accounts.map((a) =>
          tx.accountItem.update({
            where: { id: a.id },
            data: { sold: true, soldAt: new Date(), orderId: createdOrder.id },
          })
        )
      );

      return createdOrder;
    });

    return NextResponse.json({
      message: `Mua thành công ${qty} tài khoản`,
      orderId: order.id,
      product: product.name,
      accounts: accounts.map((a) => a.content),
      total: order.amount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Lỗi mua hàng", error: error?.message || String(error) },
      { status: 500 }
    );
  }
}