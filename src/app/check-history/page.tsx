"use client";

import { useEffect, useState } from "react";

export default function CheckHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tiktok/check-history")
      .then((res) => res.json())
      .then((data) => setHistory(data.history || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={page}>
  <a href="/" style={backBtn}>
    ← Quay lại trang chủ
  </a>

  <h1>Lịch sử Check MVD TikTok</h1>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr>
                {[
                  "Thời gian",
                  "Mã đơn",
                  "Mã vận đơn",
                  "Shop",
                  "Sản phẩm",
                  "Tổng tiền",
                  "Đơn vị VC",
                  "Tên shipper",
                  "SĐT shipper",
                  "Phí",
                ].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {history.map((r) => (
                <tr key={r.id}>
                  <td style={td}>{new Date(r.createdAt).toLocaleString("vi-VN")}</td>
                  <td style={td}>{r.orderId || ""}</td>
                  <td style={td}>{r.trackingNo || ""}</td>
                  <td style={td}>{r.shopName || ""}</td>
                  <td style={{ ...td, whiteSpace: "normal", minWidth: 300 }}>
                    {r.product || ""}
                  </td>
                  <td style={td}>{r.total || ""}</td>
                  <td style={td}>{r.carrierName || ""}</td>
                  <td style={td}>{r.shipperName || ""}</td>
                  <td style={td}>{r.shipperPhone || ""}</td>
                  <td style={td}>{Number(r.cost || 0).toLocaleString("vi-VN")}đ</td>
                </tr>
              ))}
            </tbody>
          </table>

          {history.length === 0 && <p>Chưa có lịch sử check.</p>}
        </div>
      )}
    </div>
  );
}

const page: any = {
  padding: 24,
  background: "#0f172a",
  minHeight: "100vh",
  color: "white",
  fontFamily: "Arial",
};

const table: any = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 1300,
  background: "#020617",
};

const th: any = {
  padding: 10,
  background: "#111827",
  borderBottom: "1px solid #334155",
  borderRight: "1px solid #334155",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const td: any = {
  padding: 10,
  borderBottom: "1px solid #1e293b",
  borderRight: "1px solid #1e293b",
  whiteSpace: "nowrap",
};
const backBtn: any = {
  display: "inline-block",
  color: "#22d3ee",
  textDecoration: "none",
  fontWeight: 900,
  marginBottom: 18,
};