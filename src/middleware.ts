import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function getToken(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "shop_mmo_secret_123456"
    );

    const { payload } = await jwtVerify(token, secret);

    return payload as {
      id?: string;
      role?: string;
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Cho phép file tĩnh
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|woff|woff2|ttf)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const user = await getToken(req);

  // Chỉ ADMIN mới được vào
  if (user?.role === "ADMIN") {
    return NextResponse.next();
  }

  // Chặn tất cả
  return new NextResponse("403 Forbidden - Website chỉ dành cho Admin", {
    status: 403,
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};