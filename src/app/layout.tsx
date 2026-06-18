import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Nguyên Liệu MMO",
  description:
    "Shop bán TikTok Việt, Gmail, Hotmail, Shopee, Proxy tự động 24/7. Giao tài khoản ngay sau khi thanh toán.",
  keywords: [
    "shop mmo",
    "nguyên liệu mmo",
    "tiktok việt",
    "gmail",
    "hotmail",
    "shopee",
    "proxy",
  ],
  metadataBase: new URL("https://shopnguyenlieummo.uk"),

  openGraph: {
    title: "Shop Nguyên Liệu MMO",
    description:
      "Shop bán TikTok Việt, Gmail, Hotmail, Shopee, Proxy tự động 24/7.",
    url: "https://shopnguyenlieummo.uk",
    siteName: "Shop Nguyên Liệu MMO",
    locale: "vi_VN",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}