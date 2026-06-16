"use client";

import { useEffect, useState } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    setLoading(true);

    try {
      const res = await fetch("/api/admin-orders");
      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders || []);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <main style={styles.page}>
      <AdminNav />

      <div style={styles.headerBox}>
        <h1 style={styles.title}>📋 Quản lý đơn hàng</h1>

        <button onClick={loadOrders} style={styles.reloadBtn}>
          ↻ Tải lại
        </button>
      </div>

      {loading ? (
        <div>Đang tải đơn hàng...</div>
      ) : (
        <div style={styles.tableBox}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Mã đơn</th>
                <th style={styles.th}>Sản phẩm</th>
                <th style={styles.th}>Số tiền</th>
                <th style={styles.th}>Ngày mua</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={styles.td}>{o.id}</td>
                  <td style={styles.td}>{o.productName || o.product}</td>
                  <td style={styles.td}>
                    {Number(o.amount || 0).toLocaleString("vi-VN")}đ
                  </td>
                  <td style={styles.td}>
                    {new Date(o.createdAt).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={4} style={styles.empty}>
                    Chưa có đơn hàng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function AdminNav() {
  return (
    <div style={styles.nav}>
      <a href="/" style={styles.homeBtn}>
        ← Trang chủ
      </a>

      <a href="/admin/dashboard" style={styles.navBtn}>
        📊 Dashboard
      </a>

      <a href="/admin" style={styles.navBtn}>
        📦 Sản phẩm
      </a>

      <a href="/admin/stock" style={styles.navBtn}>
        📥 Kho
      </a>

      <a href="/admin/orders" style={styles.activeBtn}>
        📋 Đơn hàng
      </a>

      <a href="/admin/users" style={styles.navBtn}>
        👤 Users
      </a>

      <a href="/admin/settings" style={styles.navBtn}>
        ⚙️ Cài đặt
      </a>
    </div>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    padding: 30,
    fontFamily: "Arial, sans-serif",
  },

  nav: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 22,
    padding: 14,
    borderRadius: 12,
    background: "rgba(15,23,42,.85)",
    border: "1px solid rgba(255,255,255,.12)",
  },

  homeBtn: {
    background: "linear-gradient(90deg,#06b6d4,#ec4899)",
    color: "white",
    textDecoration: "none",
    padding: "10px 15px",
    borderRadius: 8,
    fontWeight: 900,
  },

  navBtn: {
    background: "#1e293b",
    color: "white",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: 8,
    fontWeight: 800,
  },

  activeBtn: {
    background: "#2563eb",
    color: "white",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: 8,
    fontWeight: 900,
  },

  headerBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    margin: 0,
  },

  reloadBtn: {
    background: "#334155",
    color: "white",
    border: 0,
    padding: "10px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800,
  },

  tableBox: {
    background: "#111827",
    borderRadius: 12,
    overflow: "auto",
    border: "1px solid rgba(255,255,255,.12)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: 14,
    borderBottom: "1px solid rgba(255,255,255,.12)",
    color: "#93c5fd",
  },

  td: {
    padding: 14,
    borderBottom: "1px solid rgba(255,255,255,.08)",
  },

  empty: {
    textAlign: "center",
    padding: 30,
    color: "#cbd5e1",
  },
};