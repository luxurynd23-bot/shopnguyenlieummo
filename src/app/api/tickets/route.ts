import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { sendTelegram } from "@/lib/telegram";

async function getUser(req: Request) {
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

    return await prisma.user.findUnique({
      where: { id: decoded.id },
    });
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const user = await getUser(req);

  if (!user) {
    return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
  }

  if (user.isBanned) {
    return NextResponse.json(
      { message: "Tài khoản đã bị khóa" },
      { status: 403 }
    );
  }

  const tickets = await prisma.ticket.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tickets });
}

export async function POST(req: Request) {
  const user = await getUser(req);

  if (!user) {
    return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
  }

  if (user.isBanned) {
    return NextResponse.json(
      { message: "Tài khoản đã bị khóa" },
      { status: 403 }
    );
  }

  const body = await req.json();

  const title = String(body.title || "").trim();
  const message = String(body.message || "").trim();

  if (!title || !message) {
    return NextResponse.json(
      { message: "Thiếu tiêu đề hoặc nội dung" },
      { status: 400 }
    );
  }

  if (title.length > 200) {
    return NextResponse.json(
      { message: "Tiêu đề quá dài" },
      { status: 400 }
    );
  }

  if (message.length > 5000) {
    return NextResponse.json(
      { message: "Nội dung quá dài" },
      { status: 400 }
    );
  }

  const ticket = await prisma.ticket.create({
    data: {
      userId: user.id,
      title,
      message,
    },
  });
await sendTelegram(`
🎫 <b>TICKET MỚI</b>

👤 User: ${user.email}
📝 Tiêu đề: ${title}
💬 Nội dung: ${message}
🆔 Ticket ID: ${ticket.id}
`);
  return NextResponse.json({
    message: "Đã gửi hỗ trợ",
    ticket,
  });
}