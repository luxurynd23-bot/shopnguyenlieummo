"use client";

import { useEffect, useState } from "react";

export default function AdminCheckStatsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/check-stats")
      .then((res) => res.json())
      .then((data) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={page}>Đang tải...</div>;
  }

  if (data?.message) {
    return <div style={page}>{data.message}</div>;
  }

  return (
    <div style={page}>
      <h1>Thống kê Check MVD TikTok</h1>

      <div style={cards}>
        <div style={card}>
  <div>User đã check</div>
  <b>{data.totalUsersChecked}</b>
</div>

        <div style={card}>
          <div>Doanh thu tổng</div>
          <b>{formatMoney(data.totalRevenue)}</b>
        </div>

        <div style={card}>
          <div>Lượt check hôm nay</div>
          <b>{data.todayCheck}</b>
        </div>

        <div style={card}>
          <div>Doanh thu hôm nay</div>
          <b>{formatMoney(data.todayRevenue)}</b>
        </div>
        <div style={card}>
  <div>Chi phí API tổng</div>
  <b>{formatMoney(data.totalApiCost)}</b>
</div>

<div style={card}>
  <div>Lợi nhuận tổng</div>
  <b style={{ color: "#22c55e" }}>
    {formatMoney(data.totalProfit)}
  </b>
</div>

<div style={card}>
  <div>Chi phí API hôm nay</div>
  <b>{formatMoney(data.todayApiCost)}</b>
</div>

<div style={card}>
  <div>Lợi nhuận hôm nay</div>
  <b style={{ color: "#22c55e" }}>
    {formatMoney(data.todayProfit)}
  </b>
</div>
<div style={card}>
  <div>Lượt check 7 ngày</div>
  <b>{data.sevenDayCheck}</b>
</div>

<div style={card}>
  <div>Doanh thu 7 ngày</div>
  <b>{formatMoney(data.sevenDayRevenue)}</b>
</div>

<div style={card}>
  <div>Lợi nhuận 7 ngày</div>
  <b style={{ color: "#22c55e" }}>
    {formatMoney(data.sevenDayProfit)}
  </b>
</div>

<div style={card}>
  <div>Lượt check 30 ngày</div>
  <b>{data.thirtyDayCheck}</b>
</div>

<div style={card}>
  <div>Doanh thu 30 ngày</div>
  <b>{formatMoney(data.thirtyDayRevenue)}</b>
</div>

<div style={card}>
  <div>Lợi nhuận 30 ngày</div>
  <b style={{ color: "#22c55e" }}>
    {formatMoney(data.thirtyDayProfit)}
  </b>
</div>
<div style={card}>
  <div>User đã check</div>
  <b>{data.totalUsersChecked}</b>
</div>
      </div>

      <h2>Top user check nhiều nhất</h2>

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>User</th>
            <th style={th}>Email</th>
            <th style={th}>Số lượt</th>
            <th style={th}>Doanh thu</th>
          </tr>
        </thead>

        <tbody>
          {(data.topUsers || []).map((u: any) => (
            <tr key={u.userId}>
              <td style={td}>{u.name || u.userId}</td>
              <td style={td}>{u.email}</td>
              <td style={td}>{u.count}</td>
              <td style={td}>{formatMoney(u.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatMoney(n: number) {
  return Number(n || 0).toLocaleString("vi-VN") + "đ";
}

const page: any = {
  padding: 24,
  background: "#0f172a",
  minHeight: "100vh",
  color: "white",
  fontFamily: "Arial",
};

const cards: any = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 16,
  marginBottom: 24,
};

const card: any = {
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: 18,
};

const table: any = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#020617",
};

const th: any = {
  padding: 12,
  background: "#111827",
  borderBottom: "1px solid #334155",
  textAlign: "left",
};

const td: any = {
  padding: 12,
  borderBottom: "1px solid #1e293b",
};