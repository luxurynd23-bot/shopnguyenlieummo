import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

async function checkAdmin(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  const token = cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) return false;

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "shop_mmo_secret_123456"
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        role: true,
        isBanned: true,
      },
    });

    return user?.role === "ADMIN" && !user?.isBanned;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json(
      { message: "Không có quyền" },
      { status: 403 }
    );
  }

  const items = await prisma.accountItem.findMany({
    where: {
      sold: false,
    },
    select: {
      content: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const txt = items.map((x) => x.content).join("\n");

  return new Response(txt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="stock.txt"',
      "Cache-Control": "no-store",
    },
  });
}