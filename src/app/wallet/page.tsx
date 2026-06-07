"use client";

import { useEffect, useState } from "react";

export default function Wallet() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

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
        <h1 className="text-xl font-bold">Ví của tôi</h1>

        <p className="mt-3">Email: {user.email}</p>

        <p className="mt-3 text-2xl font-bold text-blue-600">
          {user.balance.toLocaleString("vi-VN")}đ
        </p>

        <a href="/deposit" className="btn mt-4 block text-center">
          Nạp tiền
        </a>

        <a href="/" className="mt-3 block underline">
          Quay lại trang chủ
        </a>
      </div>
    </main>
  );
}