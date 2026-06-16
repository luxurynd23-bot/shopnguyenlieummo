import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

async function getAdminUser(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const token = cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) return null;

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "shop_mmo_secret_123456"
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        role: true,
        isBanned: true,
      },
    });

    if (!user || user.role !== "ADMIN" || user.isBanned) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const admin = await getAdminUser(req);

  if (!admin) {
    return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      balance: true,
      totalDeposit: true,
      referralBalance: true,
      vipLevel: true,
      isBanned: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const admin = await getAdminUser(req);

  if (!admin) {
    return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
  }

  const body = await req.json();

  if (!body.userId) {
    return NextResponse.json({ message: "Thiếu userId" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: body.userId },
    select: {
      id: true,
      balance: true,
      role: true,
      isBanned: true,
    },
  });

  if (!targetUser) {
    return NextResponse.json(
      { message: "Không tìm thấy user" },
      { status: 404 }
    );
  }

  if (body.action === "toggleBan") {
    const nextBanStatus = Boolean(body.isBanned);

    if (admin.id === body.userId && nextBanStatus) {
      return NextResponse.json(
        { message: "Không thể tự khóa tài khoản admin đang đăng nhập" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: body.userId },
      data: {
        isBanned: nextBanStatus,
      },
    });

    return NextResponse.json({
      message: nextBanStatus ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản",
      user,
    });
  }

  if (body.action === "setRole") {
    const nextRole = body.role === "ADMIN" ? "ADMIN" : "USER";

    if (admin.id === body.userId && nextRole !== "ADMIN") {
      return NextResponse.json(
        { message: "Không thể tự hạ quyền admin đang đăng nhập" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: body.userId },
      data: {
        role: nextRole,
      },
    });

    return NextResponse.json({
      message: "Đã cập nhật quyền",
      user,
    });
  }

  if (body.action === "setVip") {
    const vipLevel = String(body.vipLevel || "BRONZE").toUpperCase();
    const allowVip = ["BRONZE", "SILVER", "GOLD", "DIAMOND"];

    if (!allowVip.includes(vipLevel)) {
      return NextResponse.json(
        { message: "VIP không hợp lệ" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: body.userId },
      data: {
        vipLevel: vipLevel as any,
      },
    });

    return NextResponse.json({
      message: "Đã cập nhật VIP",
      user,
    });
  }

  if (body.action === "balance") {
    const amount = Number(body.amount);
    const type = body.type === "minus" ? "minus" : "add";

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: "Số tiền không hợp lệ" },
        { status: 400 }
      );
    }

    if (type === "minus" && targetUser.balance < amount) {
      return NextResponse.json(
        { message: "Số dư không đủ để trừ" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: body.userId },
      data: {
        balance:
          type === "minus"
            ? { decrement: amount }
            : { increment: amount },
      },
    });

    await prisma.walletHistory.create({
      data: {
        userId: body.userId,
        type: type === "minus" ? "ADMIN_MINUS" : "ADMIN_ADD",
        amount,
        note: type === "minus" ? "Admin trừ tiền" : "Admin cộng tiền",
      },
    });

    return NextResponse.json({
      message: "Đã cập nhật số dư",
      user,
    });
  }

  return NextResponse.json(
    { message: "Action không hợp lệ" },
    { status: 400 }
  );
}