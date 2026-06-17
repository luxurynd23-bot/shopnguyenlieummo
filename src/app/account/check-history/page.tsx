"use client";

import { useEffect, useState } from "react";

export default function UserCheckHistoryPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/check-history")
      .then((res) => res.json())
      .then((data) => setItems(data.items || []));
  }, []);

  return (
    <div style={page}>
      <h1>Lịch sử Check MVD</h1>

      <div style={{ overflowX: "auto" }}>
        <table style={table}>
          <thead>
            <tr>
              {[
                "Thời gian",
                "Mã đơn",
                "MVD",
                "Shop",
                "Sản phẩm",
                "Đơn vị VC",
                "Shipper",
                "SĐT shipper",
                "Phí",
              ].map((h) => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {items.map((x) => (
              <tr key={x.id}>
                <td style={td}>{new Date(x.createdAt).toLocaleString("vi-VN")}</td>
                <td style={td}>{x.orderId || ""}</td>
                <td style={{ ...td, color: "#22c55e", fontWeight: 900 }}>{x.trackingNo || ""}</td>
                <td style={td}>{x.shopName || ""}</td>
                <td style={{ ...td, whiteSpace: "normal", minWidth: 300 }}>{x.product || ""}</td>
                <td style={td}>{x.carrierName || ""}</td>
                <td style={td}>{x.shipperName || ""}</td>
                <td style={td}>{x.shipperPhone || ""}</td>
                <td style={td}>{Number(x.cost || 0).toLocaleString("vi-VN")}đ</td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && <p>Chưa có lịch sử check.</p>}
      </div>
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
  minWidth: 1300,
  borderCollapse: "collapse",
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