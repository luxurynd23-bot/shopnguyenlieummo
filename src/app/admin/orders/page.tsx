"use client";

import { useEffect, useState } from "react";

interface AccountItem {
  id: string;
  content: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  items: AccountItem[];
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadOrder() {
    setLoading(true);
    const res = await fetch(`/api/orders/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setOrder(data.order);
    } else {
      setOrder(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  if (loading) return <div style={{ padding: 30 }}>Đang tải đơn hàng...</div>;
  if (!order) return <div style={{ padding: 30 }}>Không tìm thấy đơn hàng.</div>;

  return (
    <main style={{ padding: 30, fontFamily: "Arial", minHeight: "100vh", background: "#f3f6fb" }}>
      <h1>Chi tiết đơn hàng #{order.orderNumber}</h1>

      <button
        onClick={() => {
          const allContent = order.items.map(i => i.content).join("\n");
          navigator.clipboard.writeText(allContent);
          alert("Đã sao chép tất cả tài khoản");
        }}
        style={{
          background: "#10b981",
          color: "white",
          border: 0,
          padding: "10px 18px",
          borderRadius: 6,
          fontWeight: 800,
          marginBottom: 16,
        }}
      >
        Sao Chép Tất Cả
      </button>

      <div style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 6px 18px rgba(0,0,0,.08)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 160px",
            background: "#1e40af",
            color: "white",
            fontWeight: 900,
            padding: 12,
          }}
        >
          <div>Tài khoản</div>
          <div>Hành động</div>
        </div>

        {order.items.map((i, index) => (
          <div
            key={i.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 160px",
              borderTop: "1px solid #ddd",
              alignItems: "center",
              padding: "8px 12px",
            }}
          >
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{i.content}</pre>
            <div>
              <button
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: 0,
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
                onClick={() => {
                  navigator.clipboard.writeText(i.content);
                  alert("Đã sao chép tài khoản");
                }}
              >
                Sao Chép
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}