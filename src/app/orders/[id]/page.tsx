"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function OrderDetailPage() {
  const params = useParams();
  const id = String(params?.id || "");

  const [order, setOrder] = useState<any>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load dữ liệu đơn hàng
  useEffect(() => {
    if (!id) return;

    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data.order);
        setAccounts(data.accounts || []);
      })
      .catch(() => {
        setOrder(null);
        setAccounts([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  function copy(text: string) {
    navigator.clipboard.writeText(text || "");
    alert("Đã sao chép");
  }

  function downloadAll() {
    const text = accounts.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `don-hang-${id}.txt`;
    link.click();
  }

  if (loading) {
    return <main style={page}>Đang tải chi tiết đơn hàng...</main>;
  }

  if (!order) {
    return (
      <main style={page}>
        <a href="/orders" style={backBtn}>← Quay lại lịch sử mua</a>
        <div style={box}>Không tìm thấy đơn hàng.</div>
      </main>
    );
  }

  return (
    <main style={page}>
      <div style={topBar}>
        <a href="/orders" style={backBtn}>← Quay lại</a>

        <div>
          <button onClick={downloadAll} style={downloadBtn}>
            ⬇ Tải về
          </button>
          <button onClick={() => copy(accounts.join("\n"))} style={copyAllBtn}>
            📋 Sao chép tất cả
          </button>
        </div>
      </div>

      <section style={box}>
        <h1 style={title}>Chi tiết đơn hàng</h1>

        <div style={infoGrid}>
          <div style={infoCard}>
            <span>Mã đơn</span>
            <b>{String(order.id).slice(-12).toUpperCase()}</b>
          </div>

          <div style={infoCard}>
            <span>Sản phẩm</span>
            <b>{order.product}</b>
          </div>

          <div style={infoCard}>
            <span>Thanh toán</span>
            <b style={{ color: "#dc2626" }}>
              {order.amount.toLocaleString("vi-VN")}đ
            </b>
          </div>

          <div style={infoCard}>
            <span>Ngày mua</span>
            <b>{new Date(order.createdAt).toLocaleString("vi-VN")}</b>
          </div>
        </div>

        <div style={head}>
          <div style={cell}>#</div>
          <div style={cell}>Tài khoản được giao</div>
          <div style={cell}>Thao tác</div>
        </div>

        {accounts.map((acc, index) => (
          <div key={index} style={row}>
            <div style={cell}>{index + 1}</div>
            <div style={cell}>
              <textarea readOnly value={acc} style={resourceBox} />
            </div>
            <div style={cell}>
              <button onClick={() => copy(acc)} style={copyBtn}>
                📋 Sao chép
              </button>
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <div style={{ padding: 20 }}>
            Đơn này chưa có tài khoản được giao.
          </div>
        )}
      </section>
    </main>
  );
}

// Styles
const page: React.CSSProperties = {
  background: "#f3f6fb",
  minHeight: "100vh",
  fontFamily: "Arial",
  padding: 24,
};

const topBar: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 18,
};

const backBtn: React.CSSProperties = {
  display: "inline-block",
  background: "#ef4444",
  color: "white",
  padding: "10px 14px",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 900,
};

const box: React.CSSProperties = {
  background: "white",
  padding: 24,
  borderRadius: 12,
  boxShadow: "0 6px 18px rgba(0,0,0,.08)",
};

const title: React.CSSProperties = {
  marginTop: 0,
  fontSize: 28,
  fontWeight: 900,
};

const infoGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 12,
  marginBottom: 24,
};

const infoCard: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 14,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const head: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "80px 1fr 220px",
  background: "#eef3fb",
  fontWeight: 900,
  border: "1px solid #cbd5e1",
};

const row: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "80px 1fr 220px",
  alignItems: "center",
  borderLeft: "1px solid #cbd5e1",
  borderRight: "1px solid #cbd5e1",
  borderBottom: "1px solid #cbd5e1",
};

const cell: React.CSSProperties = {
  padding: 14,
  fontSize: 15,
};

const resourceBox: React.CSSProperties = {
  width: "100%",
  minHeight: 70,
  background: "#e5e7eb",
  border: 0,
  borderRadius: 8,
  padding: 12,
  resize: "vertical",
  fontFamily: "monospace",
  fontSize: 14,
  color: "#111827",
};

const copyBtn: React.CSSProperties = {
  background: "#ef4444",
  color: "white",
  border: 0,
  borderRadius: 8,
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer",
};

const downloadBtn: React.CSSProperties = {
  background: "#14b8a6",
  color: "white",
  border: 0,
  borderRadius: 8,
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer",
  marginRight: 8,
};

const copyAllBtn: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: 0,
  borderRadius: 8,
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer",
};