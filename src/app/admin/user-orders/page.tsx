"use client";

import { useEffect, useState } from "react";

export default function AdminUserOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const res = await fetch("/api/admin/user-orders", { cache: "no-store" });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = orders.filter((o) => {
    const text = `${o.id} ${o.user?.email} ${o.user?.name} ${o.productName} ${o.amount}`.toLowerCase();
    return text.includes(keyword.toLowerCase());
  });

  return (
    <main style={styles.page}>
      <a href="/" style={styles.back}>← Về trang chủ</a>

      <h1>🛒 Admin - Lịch sử mua acc của user</h1>

      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Tìm email, tên user, sản phẩm, mã đơn..."
        style={styles.search}
      />

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {[
                  "Thời gian",
                  "User",
                  "Email",
                  "Mã đơn",
                  "Sản phẩm",
                  "Số tiền",
                  "Acc đã giao",
                ].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td style={styles.td}>
                    {new Date(o.createdAt).toLocaleString("vi-VN")}
                  </td>

                  <td style={styles.td}>
                    {o.user?.name || "Không có tên"}
                    <div style={styles.sub}>{o.user?.id}</div>
                  </td>

                  <td style={styles.td}>{o.user?.email || ""}</td>

                  <td style={styles.td}>{o.id}</td>

                  <td style={styles.td}>{o.productName || ""}</td>

                  <td style={styles.td}>
                    {Number(o.amount || 0).toLocaleString("vi-VN")}đ
                  </td>

                  <td style={{ ...styles.td, minWidth: 420, whiteSpace: "pre-wrap" }}>
                    {(o.items || [])
                      .map((item: any) => item.content)
                      .join("\n")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={styles.empty}>Không có lịch sử mua hàng.</div>
          )}
        </div>
      )}
    </main>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    padding: 24,
    fontFamily: "Arial",
  },
  back: {
    color: "#22d3ee",
    textDecoration: "none",
    fontWeight: 900,
  },
  search: {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#020617",
    color: "white",
    margin: "18px 0",
    outline: "none",
  },
  tableWrap: {
    overflowX: "auto",
    border: "1px solid #334155",
    borderRadius: 10,
  },
  table: {
    width: "100%",
    minWidth: 1300,
    borderCollapse: "collapse",
    background: "#020617",
  },
  th: {
    padding: 12,
    background: "#111827",
    borderBottom: "1px solid #334155",
    borderRight: "1px solid #334155",
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  td: {
    padding: 12,
    borderBottom: "1px solid #1e293b",
    borderRight: "1px solid #1e293b",
    whiteSpace: "nowrap",
    verticalAlign: "top",
  },
  sub: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  empty: {
    padding: 20,
    textAlign: "center",
    color: "#cbd5e1",
  },
};