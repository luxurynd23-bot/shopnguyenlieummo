"use client";

import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []));
  }, []);

  const filtered = orders.filter((o) => {
    const text = `${o.id} ${o.product} ${o.content}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <main style={page}>
      <div style={notice}>
        <p>Đơn hàng sau khi mua sẽ lưu tại đây để bạn xem lại.</p>
        <b style={{ color: "#dc2626" }}>
          ⛔ TẤT CẢ ĐƠN HÀNG TRÊN WEB NÊN ĐƯỢC COPY VÀ LƯU LẠI.
        </b>
      </div>

      <a href="/" style={backBtn}>← Quay lại</a>

      <section style={box}>
        <div style={titleRow}>
          <h1 style={{ margin: 0 }}>Lịch Sử Mua Hàng</h1>

          <div>
            Search:{" "}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchBox}
            />
          </div>
        </div>

        <div style={tableHead}>
          <div style={cell}>#</div>
          <div style={cell}>Mã giao dịch</div>
          <div style={cell}>Sản phẩm</div>
          <div style={cell}>Số lượng</div>
          <div style={cell}>Thanh toán</div>
          <div style={cell}>Thời gian</div>
          <div style={cell}>Thao tác</div>
        </div>

        {filtered.map((o, index) => {
          const code = String(o.id || "").slice(-12).toUpperCase();

          return (
            <div key={o.id} style={row}>
              <div style={cell}>{index}</div>

              <div style={{ ...cell, color: "#1e40af", fontWeight: 800 }}>
                {code}
              </div>

              <div style={cell}>
                <b>{o.product}</b>
              </div>

              <div style={{ ...cell, color: "#2563eb", fontWeight: 900 }}>
                1
              </div>

              <div style={{ ...cell, color: "red", fontWeight: 900 }}>
                {o.amount.toLocaleString("vi-VN")}đ
              </div>

              <div style={cell}>
                {new Date(o.createdAt).toLocaleString("vi-VN")}
              </div>

              <div style={cell}>
                <a href={`/orders/${o.id}`} style={blueBtn}>
                  Xem Thêm
                </a>

                <button
                  style={redBtn}
                  onClick={() => {
                    const blob = new Blob([o.content || ""], {
                      type: "text/plain;charset=utf-8",
                    });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = `${code}.txt`;
                    link.click();
                  }}
                >
                  Tải về
                </button>

                <button
                  style={orangeBtn}
                  onClick={() => {
                    navigator.clipboard.writeText(o.content || "");
                    alert("Đã copy");
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: 20 }}>Chưa có đơn mua nào.</div>
        )}
      </section>
    </main>
  );
}

const page: any = {
  padding: 24,
  background: "#f3f6fb",
  minHeight: "100vh",
  fontFamily: "Arial",
};

const notice: any = {
  background: "white",
  border: "2px solid #2563eb",
  borderRadius: 8,
  padding: 18,
  marginBottom: 18,
};

const backBtn: any = {
  display: "inline-block",
  background: "#ef4444",
  color: "white",
  padding: "10px 14px",
  borderRadius: 6,
  textDecoration: "none",
  fontWeight: 800,
  marginBottom: 18,
};

const box: any = {
  background: "white",
  borderRadius: 10,
  padding: 18,
  boxShadow: "0 6px 18px rgba(0,0,0,.08)",
};

const titleRow: any = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
};

const searchBox: any = {
  padding: 9,
  borderRadius: 6,
  border: "1px solid #cbd5e1",
};

const tableHead: any = {
  display: "grid",
  gridTemplateColumns: "70px 220px 1fr 120px 160px 220px 260px",
  background: "#eef3fb",
  fontWeight: 900,
  border: "1px solid #cbd5e1",
};

const row: any = {
  display: "grid",
  gridTemplateColumns: "70px 220px 1fr 120px 160px 220px 260px",
  alignItems: "center",
  borderLeft: "1px solid #cbd5e1",
  borderRight: "1px solid #cbd5e1",
  borderBottom: "1px solid #cbd5e1",
  minHeight: 66,
};

const cell: any = {
  padding: 12,
  fontSize: 14,
};

const blueBtn: any = {
  display: "inline-block",
  background: "#2563eb",
  color: "white",
  textDecoration: "none",
  border: 0,
  borderRadius: 6,
  padding: "8px 10px",
  fontWeight: 800,
  marginRight: 6,
};

const redBtn: any = {
  background: "#ef4444",
  color: "white",
  border: 0,
  borderRadius: 6,
  padding: "8px 10px",
  fontWeight: 800,
  marginRight: 6,
};

const orangeBtn: any = {
  background: "#d97706",
  color: "white",
  border: 0,
  borderRadius: 6,
  padding: "8px 10px",
  fontWeight: 800,
};