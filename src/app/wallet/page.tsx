"use client";

import { useEffect, useState } from "react";

export default function Wallet() {
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/me").then((r) => r.json()),
      fetch("/api/referral").then((r) => r.json()),
      fetch("/api/wallet-history").then((r) => r.json()),
    ])
      .then(([me, referral, wallet]) => {
        setUser({
          ...me.user,
          referralBalance: referral?.user?.referralBalance || 0,
          referralCount: referral?.user?.referralCount || 0,
        });

        setHistory(wallet.history || []);
      })
      .catch(() => setUser(null));
  }, []);

  function getVipName(vip: string) {
    if (vip === "DIAMOND") return "💎 DIAMOND";
    if (vip === "GOLD") return "🥇 GOLD";
    if (vip === "SILVER") return "🥈 SILVER";
    return "🥉 BRONZE";
  }

  function getVipDiscount(vip: string) {
    if (vip === "DIAMOND") return "10%";
    if (vip === "GOLD") return "5%";
    if (vip === "SILVER") return "3%";
    return "0%";
  }

  function typeLabel(type: string) {
    if (type === "DEPOSIT") return "💳 Nạp tiền";
    if (type === "PURCHASE") return "🛒 Mua hàng";
    if (type === "REFERRAL") return "🎁 Hoa hồng";
    if (type === "ADMIN_ADD") return "➕ Admin cộng";
    if (type === "ADMIN_MINUS") return "➖ Admin trừ";
    return type || "Giao dịch";
  }

  function amountColor(type: string) {
    if (type === "PURCHASE" || type === "ADMIN_MINUS") {
      return "text-red-600";
    }

    return "text-green-600";
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-md p-6">
        <div className="card">
          <h1 className="text-xl font-bold">Ví của tôi</h1>

          <p className="mt-3">Bạn chưa đăng nhập.</p>

          <a href="/login" className="btn mt-4 block text-center">
            Đăng nhập
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <div className="card">
        <h1 className="text-xl font-bold">💰 Ví của tôi</h1>

        <p className="mt-3">Email: {user.email}</p>

        <div className="mt-4 rounded-lg border p-4">
          <div>Số dư chính</div>

          <div className="mt-2 text-2xl font-bold text-blue-600">
            {Number(user.balance || 0).toLocaleString("vi-VN")}đ
          </div>
        </div>

        <div className="mt-4 rounded-lg border p-4">
          <div>👑 Cấp VIP</div>

          <div className="mt-2 text-2xl font-bold text-yellow-500">
            {getVipName(user.vipLevel || "BRONZE")}
          </div>

          <p className="mt-2">
            Giảm giá mua hàng:{" "}
            <b>{getVipDiscount(user.vipLevel || "BRONZE")}</b>
          </p>

          <p className="mt-1 text-sm">
            Tổng nạp:{" "}
            <b>{Number(user.totalDeposit || 0).toLocaleString("vi-VN")}đ</b>
          </p>
        </div>

        <div className="mt-4 rounded-lg border p-4">
          <div>🎁 Hoa hồng giới thiệu</div>

          <div className="mt-2 text-2xl font-bold text-pink-600">
            {Number(user.referralBalance || 0).toLocaleString("vi-VN")}đ
          </div>
        </div>

        <div className="mt-4 rounded-lg border p-4">
          <div>👥 Đã giới thiệu</div>

          <div className="mt-2 text-2xl font-bold text-green-600">
            {user.referralCount || 0} người
          </div>
        </div>

        <div className="mt-4 rounded-lg border p-4">
          <div className="mb-3 font-bold">📜 Lịch sử giao dịch</div>

          {history.length === 0 && <div>Chưa có giao dịch</div>}

          {history.map((item) => (
            <div key={item.id} className="border-b py-2">
              <div className="font-bold">{typeLabel(item.type)}</div>

              <div className={amountColor(item.type)}>
                {item.type === "PURCHASE" || item.type === "ADMIN_MINUS"
                  ? "-"
                  : "+"}
                {Number(item.amount || 0).toLocaleString("vi-VN")}đ
              </div>

              <div>{item.note || "-"}</div>

              <div className="text-sm opacity-70">
                {new Date(item.createdAt).toLocaleString("vi-VN")}
              </div>
            </div>
          ))}
        </div>

        <a href="/referral" className="btn mt-4 block text-center">
          🎁 Trang giới thiệu
        </a>

        <a href="/deposit" className="btn mt-3 block text-center">
          💳 Nạp tiền
        </a>

        <a href="/" className="mt-3 block underline">
          Quay lại trang chủ
        </a>
      </div>
    </main>
  );
}