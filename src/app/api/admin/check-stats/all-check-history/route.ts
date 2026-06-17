import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

async function getAdmin(req: Request) {
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

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function GET(req: Request) {
  try {
    const admin = await getAdmin(req);

    if (!admin) {
      return NextResponse.json(
        { message: "Không có quyền admin" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = String(searchParams.get("q") || "").trim();

    const history = await prisma.tiktokCheckHistory.findMany({
      where: q
        ? {
            OR: [
              { orderId: { contains: q, mode: "insensitive" } },
              { trackingNo: { contains: q, mode: "insensitive" } },
              { shopName: { contains: q, mode: "insensitive" } },
              { product: { contains: q, mode: "insensitive" } },
              { shipperName: { contains: q, mode: "insensitive" } },
              { shipperPhone: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
              { address: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 300,
    });

    return NextResponse.json({ history });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Lỗi lấy lịch sử check" },
      { status: 500 }
    );
  }
}