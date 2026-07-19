import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Chỉ khóa khi chạy trên Vercel/Production
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  // Khi chạy localhost thì vẫn cho phép
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};