"use client";

import { useEffect, useState } from "react";

export default function DepositHistoryPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/deposit-history")
      .then((r) => r.json())
      .then((d) => setItems(d.deposits || []));
  }, []);

  return (
    <main style={{
      padding: 30,
      fontFamily: "Arial",
      background: "#f3f6fb",
      minHeight: "100vh"
    }}>
      <h1>Lịch sử nạp tiền</h1>

      <div style={{ marginBottom: 20 }}>
        <a href="/">← Trang chủ</a>
      </div>

      <div style={{
        background: "white",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 6px 18px rgba(0,0,0,.08)"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "180px 150px 150px 1fr",
          background: "#263f83",
          color: "white",
          fontWeight: 900
        }}>
          <div style={cell}>Ngày</div>
          <div style={cell}>Số tiền</div>
          <div style={cell}>Trạng thái</div>
          <div style={cell}>Nội dung CK</div>
        </div>

        {items.map((x) => (
          <div key={x.id}
            style={{
              display: "grid",
              gridTemplateColumns: "180px 150px 150px 1fr",
              borderTop: "1px solid #ddd"
            }}>
            <div style={cell}>
              {new Date(x.createdAt).toLocaleString("vi-VN")}
            </div>

            <div style={cell}>
              {x.amount.toLocaleString("vi-VN")}đ
            </div>

            <div style={cell}>
              {x.status === "PAID"
                ? "✅ Đã nạp"
                : "⏳ Chờ xử lý"}
            </div>

            <div style={cell}>{x.note}</div>
          </div>
        ))}
      </div>
    </main>
  );
}

const cell: any = {
  padding: 12,
  fontSize: 14,
};