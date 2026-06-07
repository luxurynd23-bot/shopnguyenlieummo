"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    setLoading(true);

    const res = await fetch("/api/admin-dashboard");

    if (res.ok) {
      const data = await res.json();
      setStats(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <div style={{ padding: 30 }}>Đang tải dashboard...</div>;
  }

  if (!stats) {
    return <div style={{ padding: 30 }}>Không thể tải dữ liệu dashboard.</div>;
  }

  return (
    <main
      style={{
        padding: 30,
        fontFamily: "Arial",
        minHeight: "100vh",
        background: "#f3f6fb",
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 900,
          marginBottom: 24,
        }}
      >
        Dashboard Admin
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 20,
          marginBottom: 30,
        }}
      >
        <div style={cardStyle}>
          <div style={cardTitle}>Tổng người dùng</div>
          <div style={cardValue}>{stats.totalUsers}</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Tổng đơn hàng</div>
          <div style={cardValue}>{stats.totalOrders}</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Doanh thu</div>
          <div style={cardValue}>
            {stats.totalRevenue.toLocaleString("vi-VN")}đ
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Tiền nạp</div>
          <div style={cardValue}>
            {stats.totalDeposit.toLocaleString("vi-VN")}đ
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Kho còn</div>
          <div style={cardValue}>{stats.stockLeft}</div>
        </div>
      </div>

      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 6px 18px rgba(0,0,0,.08)",
          marginBottom: 25,
        }}
      >
        <h2 style={{ fontWeight: 900 }}>Thống kê nhanh</h2>

        <ul>
          <li>👤 User: {stats.totalUsers}</li>
          <li>🛒 Đơn hàng: {stats.totalOrders}</li>
          <li>
            💰 Doanh thu: {stats.totalRevenue.toLocaleString("vi-VN")}đ
          </li>
          <li>
            🏦 Tiền nạp: {stats.totalDeposit.toLocaleString("vi-VN")}đ
          </li>
          <li>📦 Kho còn: {stats.stockLeft}</li>
        </ul>
      </div>

      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 6px 18px rgba(0,0,0,.08)",
        }}
      >
        <h2>Doanh thu theo ngày</h2>

        {(stats.revenueByDay || []).map((x: any) => (
          <div key={x.day} style={{ marginTop: 15 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <b>{x.day}</b>
              <b>{x.total.toLocaleString("vi-VN")}đ</b>
            </div>

            <div
              style={{
                height: 12,
                background: "#e5e7eb",
                borderRadius: 999,
                overflow: "hidden",
                marginTop: 6,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width:
                    Math.min(
                      100,
                      (x.total /
                        Math.max(
                          ...(stats.revenueByDay || [{ total: 1 }]).map(
                            (r: any) => r.total
                          )
                        )) *
                        100
                    ) + "%",
                  background: "#2563eb",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

const cardStyle: any = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 6px 18px rgba(0,0,0,.08)",
};

const cardTitle: any = {
  fontSize: 14,
  fontWeight: 700,
  color: "#64748b",
};

const cardValue: any = {
  fontSize: 24,
  fontWeight: 900,
  color: "#1e3a8a",
  marginTop: 6,
};