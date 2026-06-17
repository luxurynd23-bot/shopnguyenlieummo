"use client";

import { useEffect, useState } from "react";

export default function AdminWalletHistoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("ALL");

  async function loadItems() {
    const res = await fetch("/api/admin-wallet-history");
    const data = await res.json();

    if (res.ok) {
      setItems(data.items || []);
    } else {
      alert(data.message || "Lỗi tải lịch sử ví");
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function money(value: any) {
    return Number(value || 0).toLocaleString("vi-VN") + "đ";
  }
function exportExcel() {
  const html = `
    <table border="1">
      <tr>
        <th>User</th>
        <th>Email</th>
        <th>Loại</th>
        <th>Số tiền</th>
        <th>Ghi chú</th>
        <th>Thời gian</th>
      </tr>
      ${filtered
        .map(
          (x) => `
        <tr>
          <td>${x.user?.name || ""}</td>
          <td>${x.user?.email || ""}</td>
          <td>${typeLabel(x.type)}</td>
          <td>${Number(x.amount || 0).toLocaleString("vi-VN")}đ</td>
          <td>${x.note || ""}</td>
          <td>${new Date(x.createdAt).toLocaleString("vi-VN")}</td>
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
  a.download = `lich-su-vi-${Date.now()}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}
  function typeLabel(t: string) {
    if (t === "DEPOSIT") return "💳 Nạp tiền";
    if (t === "PURCHASE") return "🛒 Mua hàng";
    if (t === "REFERRAL") return "🎁 Hoa hồng";
    if (t === "CHECK_MVD") return "📦 Check MVD";
    if (t === "ADMIN_ADD") return "➕ Admin cộng";
    if (t === "ADMIN_MINUS") return "➖ Admin trừ";
    return t;
  }

  const filtered = items.filter((x) => {
    const matchType = type === "ALL" || x.type === type;

    const text = `${x.user?.email || ""} ${x.user?.name || ""} ${
      x.note || ""
    } ${x.type || ""}`.toLowerCase();

    return matchType && text.includes(keyword.toLowerCase());
  });
const totalDeposit = filtered
  .filter((x) => x.type === "DEPOSIT")
  .reduce((s, x) => s + Number(x.amount || 0), 0);

const totalPurchase = filtered
  .filter((x) => x.type === "PURCHASE")
  .reduce((s, x) => s + Number(x.amount || 0), 0);

const totalCheckMVD = filtered
  .filter((x) => x.type === "CHECK_MVD")
  .reduce((s, x) => s + Math.abs(Number(x.amount || 0)), 0);

const totalReferral = filtered
  .filter((x) => x.type === "REFERRAL")
  .reduce((s, x) => s + Number(x.amount || 0), 0);
  return (
    <main style={styles.page}>
      <AdminNav />

      <div style={styles.headerBox}>
        <h1 style={styles.title}>📜 Lịch sử ví toàn hệ thống</h1>

        <div style={{ display: "flex", gap: 10 }}>
  <button onClick={loadItems} style={styles.reloadBtn}>
    ↻ Tải lại
  </button>

  <button onClick={exportExcel} style={styles.exportBtn}>
    Export Excel
  </button>
</div>
      </div>

      <div style={styles.box}>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm email, tên, ghi chú..."
          style={styles.input}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={styles.select}
        >
          <option value="ALL">Tất cả</option>
          <option value="DEPOSIT">Nạp tiền</option>
          <option value="PURCHASE">Mua hàng</option>
          <option value="CHECK_MVD">Check MVD</option>
          <option value="REFERRAL">Hoa hồng</option>
          <option value="ADMIN_ADD">Admin cộng</option>
          <option value="ADMIN_MINUS">Admin trừ</option>
        </select>

        <div style={styles.count}>
          Tổng hiển thị: <b>{filtered.length}</b>
        </div>
      </div>

      <div style={styles.tableBox}>
        </div>

<div style={styles.statsGrid}>
  <div style={styles.statCard}>
    <div>Tổng nạp</div>
    <b style={{ color: "#22c55e" }}>{money(totalDeposit)}</b>
  </div>

  <div style={styles.statCard}>
    <div>Tổng mua hàng</div>
    <b style={{ color: "#ef4444" }}>{money(totalPurchase)}</b>
  </div>

  <div style={styles.statCard}>
    <div>Tổng Check MVD</div>
    <b style={{ color: "#f59e0b" }}>{money(totalCheckMVD)}</b>
  </div>

  <div style={styles.statCard}>
    <div>Tổng hoa hồng</div>
    <b style={{ color: "#22c55e" }}>{money(totalReferral)}</b>
  </div>
</div>

      <div style={styles.tableBox}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Loại</th>
              <th style={styles.th}>Số tiền</th>
              <th style={styles.th}>Ghi chú</th>
              <th style={styles.th}>Thời gian</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td style={styles.td}>
                  <b>{item.user?.email || "-"}</b>
                  <div style={styles.smallText}>{item.user?.name || ""}</div>
                </td>

                <td style={styles.td}>{typeLabel(item.type)}</td>

                <td
                  style={{
                    ...styles.td,
                    color:
  item.type === "PURCHASE" ||
  item.type === "ADMIN_MINUS" ||
  item.type === "CHECK_MVD"
    ? "#ef4444"
    : "#22c55e",
                    fontWeight: 900,
                  }}
                >
                  {item.type === "PURCHASE" ||
 item.type === "ADMIN_MINUS" ||
 item.type === "CHECK_MVD"
                    ? "-"
                    : "+"}
                  {money(item.amount)}
                </td>

                <td style={styles.td}>{item.note || "-"}</td>

                <td style={styles.td}>
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={styles.empty}>
                  Chưa có lịch sử ví
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function AdminNav() {
  return (
    <div style={styles.nav}>
      <a href="/" style={styles.homeBtn}>← Trang chủ</a>
      <a href="/admin/dashboard" style={styles.navBtn}>📊 Dashboard</a>
      <a href="/admin" style={styles.navBtn}>📦 Sản phẩm</a>
      <a href="/admin/stock" style={styles.navBtn}>📥 Kho</a>
      <a href="/admin/orders" style={styles.navBtn}>📋 Đơn hàng</a>
      <a href="/admin/users" style={styles.navBtn}>👤 Users</a>
      <a href="/admin/wallet-history" style={styles.activeBtn}>📜 Ví</a>
      <a href="/admin/tickets" style={styles.navBtn}>🎫 Tickets</a>
      <a href="/admin/coupons" style={styles.navBtn}>🎟 Coupon</a>
      <a href="/admin/settings" style={styles.navBtn}>⚙️ Cài đặt</a>
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
    alignItems: "center",
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
    border: "1px solid rgba(255,255,255,.1)",
  },

  activeBtn: {
    background: "#2563eb",
    color: "white",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: 8,
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,.2)",
  },

  headerBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    gap: 14,
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
exportBtn: {
  background: "#16a34a",
  color: "white",
  border: 0,
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 800,
},
  box: {
    display: "grid",
    gridTemplateColumns: "1fr 220px 160px",
    gap: 12,
    background: "#111827",
    padding: 18,
    borderRadius: 12,
    marginBottom: 18,
    border: "1px solid rgba(255,255,255,.12)",
  },

  input: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,.15)",
    background: "#1e293b",
    color: "white",
    outline: "none",
  },

  select: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,.15)",
    background: "#1e293b",
    color: "white",
    outline: "none",
  },

  count: {
    display: "flex",
    alignItems: "center",
    color: "#cbd5e1",
  },
statsGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 12,
  marginBottom: 20,
},

statCard: {
  background: "#111827",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 12,
  padding: 18,
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
    whiteSpace: "nowrap",
  },

  td: {
    padding: 14,
    borderBottom: "1px solid rgba(255,255,255,.08)",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },

  smallText: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 4,
  },

  empty: {
    textAlign: "center",
    padding: 30,
    color: "#cbd5e1",
  },
};