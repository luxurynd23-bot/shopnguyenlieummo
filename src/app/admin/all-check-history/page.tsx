"use client";

import { useEffect, useState } from "react";

export default function AdminAllCheckHistoryPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRaw, setSelectedRaw] = useState<any>(null);
  const [profitStats, setProfitStats] = useState<any>({
  totalChecks: 0,
  totalRevenue: 0,
  totalApiCost: 0,
  totalProfit: 0,
});
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [quickRange, setQuickRange] = useState("all");
  async function load() {
  setLoading(true);

  const params = new URLSearchParams();
  params.set("q", q);

  if (fromDate) params.set("from", fromDate);
  if (toDate) params.set("to", toDate);

  const res = await fetch(`/api/admin/all-check-history?${params.toString()}`);
  const data = await res.json();

  setItems(data.history || []);
  setLoading(false);
}
async function loadProfitStats() {
  try {
    const res = await fetch("/api/admin/check-profit", {
      cache: "no-store",
    });

    const data = await res.json();

    setProfitStats({
      totalChecks: data.totalChecks || 0,
      totalRevenue: data.totalRevenue || 0,
      totalApiCost: data.totalApiCost || 0,
      totalProfit: data.totalProfit || 0,
    });
  } catch {
    setProfitStats({
      totalChecks: 0,
      totalRevenue: 0,
      totalApiCost: 0,
      totalProfit: 0,
    });
  }
}
  function exportExcel() {
    const html = `
      <table border="1">
        <tr>
          <th>Thời gian</th>
          <th>User</th>
          <th>Email</th>
          <th>Mã đơn</th>
          <th>MVD</th>
          <th>Shop</th>
          <th>Sản phẩm</th>
          <th>Tổng tiền</th>
          <th>Đơn vị VC</th>
          <th>Shipper</th>
          <th>SĐT shipper</th>
          <th>SĐT khách</th>
          <th>Phí</th>
          <th>Giá API</th>
          <th>Lợi nhuận</th>
        </tr>
        ${items
          .map(
            (x) => `
          <tr>
            <td>${new Date(x.createdAt).toLocaleString("vi-VN")}</td>
            <td>${x.user?.name || ""}</td>
            <td>${x.user?.email || ""}</td>
            <td>${x.orderId || ""}</td>
            <td>${x.trackingNo || ""}</td>
            <td>${x.shopName || ""}</td>
            <td>${x.product || ""}</td>
            <td>${x.total || ""}</td>
            <td>${x.carrierName || ""}</td>
            <td>${x.shipperName || ""}</td>
            <td>${x.shipperPhone || ""}</td>
            <td>${x.phone || ""}</td>
            <td>${Number(x.cost || 0).toLocaleString("vi-VN")}đ</td>
            <td>${Number(x.apiCost || 0).toLocaleString("vi-VN")}đ</td>
            <td>${Number(x.profit || 0).toLocaleString("vi-VN")}đ</td>
          </tr>
        `
          )
          .join("")}
      </table>
    `;

    const blob = new Blob([html], {
      type: "application/vnd.ms-excel",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lich-su-check-mvd-${Date.now()}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
  load();
  loadProfitStats();
}, []);

  return (
    <div style={page}>
      <a href="/" style={backBtn}>← Về trang chủ</a>
      <h1>Admin - Lịch sử Check MVD</h1>
<div style={statGrid}>
  <div style={statCard}>
    📦 {profitStats.totalChecks.toLocaleString("vi-VN")}
    <div style={statLabel}>Tổng lượt check</div>
  </div>

  <div style={statCard}>
    💰 {profitStats.totalRevenue.toLocaleString("vi-VN")}đ
    <div style={statLabel}>Tổng thu</div>
  </div>

  <div style={statCard}>
    🔌 {profitStats.totalApiCost.toLocaleString("vi-VN")}đ
    <div style={statLabel}>Phí API</div>
  </div>

  <div
    style={{
      ...statCard,
      color: profitStats.totalProfit >= 0 ? "#22c55e" : "#ef4444",
    }}
  >
    📈 {profitStats.totalProfit.toLocaleString("vi-VN")}đ
    <div style={statLabel}>Lợi nhuận</div>
  </div>
</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
  <input
    value={q}
    onChange={(e) => setQ(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") load();
    }}
    placeholder="Tìm MVD, mã đơn, SĐT, shop, shipper..."
    style={input}
  />

  <input
    type="date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
    style={dateInput}
  />

  <input
    type="date"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
    style={dateInput}
  />

  <button onClick={load} style={btn}>
    {loading ? "Đang tìm..." : "Tìm kiếm"}
  </button>

  <button
    onClick={() => {
      setFromDate("");
      setToDate("");
      setQuickRange("all");
      setTimeout(load, 50);
    }}
    style={{ ...btn, background: "#475569" }}
  >
    Tất cả
  </button>

  <button
    onClick={exportExcel}
    style={{ ...btn, background: "#16a34a" }}
  >
    Export Excel
  </button>
</div>
      <div style={{ overflowX: "auto" }}>
        <table style={table}>
          <thead>
            <tr>
              {[
                "Thời gian",
                "User",
                "Email",
                "Mã đơn",
                "MVD",
                "Shop",
                "Sản phẩm",
                "Tổng tiền",
                "Đơn vị VC",
                "Shipper",
                "SĐT shipper",
                "SĐT khách",
                "Phí",
                "Giá API",
                "Lợi nhuận",
                "JSON",
                "Xóa",
              ].map((h) => (
                <th key={h} style={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {items.map((x) => (
              <tr key={x.id}>
                <td style={td}>
                  {new Date(x.createdAt).toLocaleString("vi-VN")}
                </td>
                <td style={td}>{x.user?.name || ""}</td>
                <td style={td}>{x.user?.email || ""}</td>
                <td style={td}>{x.orderId || ""}</td>
                <td style={{ ...td, color: "#22c55e", fontWeight: 900 }}>
                  {x.trackingNo || ""}
                </td>
                <td style={td}>{x.shopName || ""}</td>
                <td style={{ ...td, whiteSpace: "normal", minWidth: 300 }}>
                  {x.product || ""}
                </td>
                <td style={td}>{x.total || ""}</td>
                <td style={td}>{x.carrierName || ""}</td>
                <td style={td}>{x.shipperName || ""}</td>
                <td style={td}>{x.shipperPhone || ""}</td>
                <td style={td}>{x.phone || ""}</td>
                <td style={td}>
                  {Number(x.cost || 0).toLocaleString("vi-VN")}đ
                </td>
                <td style={td}>
  {Number(x.apiCost || 0).toLocaleString("vi-VN")}đ
</td>

<td
  style={{
    ...td,
    color: Number(x.profit || 0) >= 0 ? "#22c55e" : "#ef4444",
    fontWeight: 900,
  }}
>
  {Number(x.profit || 0).toLocaleString("vi-VN")}đ
</td>

                <td style={td}>
                  <button style={jsonBtn} onClick={() => setSelectedRaw(x.raw)}>
                    JSON
                  </button>
                </td>

                <td style={td}>
                  <button
                    style={deleteBtn}
                    onClick={async () => {
                      if (!confirm("Xóa lịch sử này?")) return;

                      const res = await fetch(
                        `/api/admin/all-check-history/${x.id}`,
                        { method: "DELETE" }
                      );

                      if (res.ok) {
                        setItems((prev) => prev.filter((i) => i.id !== x.id));
                      } else {
                        alert("Xóa thất bại");
                      }
                    }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && <p>Không có dữ liệu.</p>}
      </div>

      {selectedRaw && (
        <div style={modal}>
          <div style={modalBox}>
            <button style={deleteBtn} onClick={() => setSelectedRaw(null)}>
              Đóng
            </button>

            <pre style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>
              {JSON.stringify(selectedRaw, null, 2)}
            </pre>
          </div>
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

const input: any = {
  flex: 1,
  padding: 12,
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
};
const dateInput: any = {
  padding: 12,
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
};
const btn: any = {
  padding: "12px 18px",
  border: 0,
  borderRadius: 8,
  background: "#2563eb",
  color: "white",
  fontWeight: 800,
};

const table: any = {
  width: "100%",
  minWidth: 2000,
  borderCollapse: "collapse",
  background: "#020617",
};

const th: any = {
  padding: 10,
  background: "#111827",
  borderBottom: "1px solid #334155",
  borderRight: "1px solid #334155",
  whiteSpace: "nowrap",
  textAlign: "left",
};

const td: any = {
  padding: 10,
  borderBottom: "1px solid #1e293b",
  borderRight: "1px solid #1e293b",
  whiteSpace: "nowrap",
};

const jsonBtn: any = {
  padding: "6px 12px",
  border: 0,
  borderRadius: 6,
  background: "#7c3aed",
  color: "#fff",
  cursor: "pointer",
};

const deleteBtn: any = {
  padding: "6px 12px",
  border: 0,
  borderRadius: 6,
  background: "#dc2626",
  color: "#fff",
  cursor: "pointer",
};

const modal: any = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.7)",
  padding: 20,
  zIndex: 9999,
};

const modalBox: any = {
  background: "#020617",
  color: "#fff",
  padding: 20,
  borderRadius: 12,
  maxHeight: "90vh",
  overflow: "auto",
};
const backBtn: any = {
  display: "inline-block",
  color: "#22d3ee",
  textDecoration: "none",
  fontWeight: 900,
  marginBottom: 18,
};
const statGrid: any = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 14,
  marginBottom: 18,
};

const statCard: any = {
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: 10,
  padding: 16,
  fontWeight: 900,
  fontSize: 20,
};

const statLabel: any = {
  fontSize: 13,
  color: "#94a3b8",
  marginTop: 8,
};