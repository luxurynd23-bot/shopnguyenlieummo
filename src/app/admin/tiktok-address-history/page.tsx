"use client";

import { useEffect, useState } from "react";

export default function AdminTiktokAddressHistoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/tiktok-address-history", {
      cache: "no-store",
    });
    const data = await res.json();
    setItems(data.history || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((x) => {
    const text = `${x.user?.email || ""} ${x.orderId || ""} ${x.phone || ""} ${x.address || ""} ${x.newAddressId || ""} ${x.status || ""}`.toLowerCase();
    return text.includes(q.toLowerCase());
  });

  function exportExcel() {
    const html = `
      <table border="1">
        <tr>
          <th>Thời gian</th>
          <th>User</th>
          <th>Email</th>
          <th>Mode</th>
          <th>Order ID</th>
          <th>Tên</th>
          <th>SĐT</th>
          <th>Địa chỉ</th>
          <th>Address ID</th>
          <th>Trạng thái</th>
          <th>Phí</th>
        </tr>
        ${filtered.map((x) => `
          <tr>
            <td>${new Date(x.createdAt).toLocaleString("vi-VN")}</td>
            <td>${x.user?.name || ""}</td>
            <td>${x.user?.email || ""}</td>
            <td>${x.mode || ""}</td>
            <td>${x.orderId || ""}</td>
            <td>${x.name || ""}</td>
            <td>${x.phone || ""}</td>
            <td>${x.address || ""}</td>
            <td>${x.newAddressId || ""}</td>
            <td>${x.status || ""}</td>
            <td>${Number(x.cost || 0).toLocaleString("vi-VN")}đ</td>
          </tr>
        `).join("")}
      </table>
    `;

    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lich-su-doi-dia-chi-${Date.now()}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main style={styles.page}>
      <a href="/" style={styles.back}>← Về trang chủ</a>
      <h1>🏠 Admin - Lịch sử đổi địa chỉ TikTok</h1>

      <div style={styles.top}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm email, order ID, SĐT, địa chỉ, Address ID..."
          style={styles.input}
        />

        <button onClick={load} style={styles.btn}>
          {loading ? "Đang tải..." : "Tải lại"}
        </button>

        <button onClick={exportExcel} style={{ ...styles.btn, background: "#16a34a" }}>
          Export Excel
        </button>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {[
                "Thời gian",
                "User",
                "Email",
                "Mode",
                "Order ID",
                "Tên",
                "SĐT",
                "Địa chỉ",
                "Address ID",
                "Trạng thái",
                "Phí",
              ].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.map((x) => (
              <tr key={x.id}>
                <td style={styles.td}>{new Date(x.createdAt).toLocaleString("vi-VN")}</td>
                <td style={styles.td}>{x.user?.name || ""}</td>
                <td style={styles.td}>{x.user?.email || ""}</td>
                <td style={styles.td}>{x.mode}</td>
                <td style={styles.td}>{x.orderId}</td>
                <td style={styles.td}>{x.name || ""}</td>
                <td style={styles.td}>{x.phone || ""}</td>
                <td style={{ ...styles.td, whiteSpace: "normal", minWidth: 360 }}>
                  {x.address || ""}
                </td>
                <td style={styles.td}>{x.newAddressId || ""}</td>
                <td style={styles.td}>{x.status}</td>
                <td style={styles.td}>{Number(x.cost || 0).toLocaleString("vi-VN")}đ</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={styles.empty}>Không có dữ liệu.</div>
        )}
      </div>
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
  top: {
    display: "flex",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    minWidth: 260,
    padding: 12,
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#020617",
    color: "white",
  },
  btn: {
    padding: "12px 18px",
    border: 0,
    borderRadius: 8,
    background: "#2563eb",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
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
    padding: 10,
    background: "#111827",
    borderBottom: "1px solid #334155",
    borderRight: "1px solid #334155",
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  td: {
    padding: 10,
    borderBottom: "1px solid #1e293b",
    borderRight: "1px solid #1e293b",
    whiteSpace: "nowrap",
  },
  empty: {
    padding: 20,
    textAlign: "center",
    color: "#94a3b8",
  },
};