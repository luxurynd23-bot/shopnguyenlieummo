"use client";

export default function AdminNav() {
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

      <a href="/admin/orders" style={styles.navBtn}>
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
  nav: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 20,
    padding: 14,
    borderRadius: 12,
    background: "#111827",
    border: "1px solid rgba(255,255,255,.1)",
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
    fontWeight: 700,
  },
};