"use client";

import { useEffect, useState } from "react";

export default function AdminSettings() {
  const [form, setForm] = useState({
    shopName: "",
    shopDomain: "",
    warrantyText: "",
    noticeText: "",
    supportZalo: "",
    groupZalo: "",
  });

  const [loading, setLoading] = useState(true);

  async function loadSettings() {
    setLoading(true);

    try {
      const res = await fetch("/api/admin-settings");

      if (res.ok) {
        const data = await res.json();

        setForm({
          shopName: data.settings?.shopName || "",
          shopDomain: data.settings?.shopDomain || "",
          warrantyText: data.settings?.warrantyText || "",
          noticeText: data.settings?.noticeText || "",
          supportZalo: data.settings?.supportZalo || "",
          groupZalo: data.settings?.groupZalo || "",
        });
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function saveSettings() {
    try {
      const res = await fetch("/api/admin-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("Đã lưu cài đặt thành công!");
      } else {
        const data = await res.json();
        alert(data.message || "Lỗi lưu cài đặt");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi lưu cài đặt");
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <AdminNav />
        <div>Đang tải cài đặt...</div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <AdminNav />

      <div style={styles.headerBox}>
        <h1 style={styles.title}>⚙️ Cài đặt Shop</h1>

        <button onClick={loadSettings} style={styles.reloadBtn}>
          ↻ Tải lại
        </button>
      </div>

      <section style={styles.box}>
        <label style={styles.label}>Tên shop</label>
        <input
          style={styles.input}
          value={form.shopName}
          onChange={(e) =>
            setForm({ ...form, shopName: e.target.value })
          }
        />

        <label style={styles.label}>Domain shop</label>
        <input
          style={styles.input}
          value={form.shopDomain}
          onChange={(e) =>
            setForm({ ...form, shopDomain: e.target.value })
          }
        />

        <label style={styles.label}>Thông báo bảo hành</label>
        <textarea
          style={{ ...styles.input, height: 90 }}
          value={form.warrantyText}
          onChange={(e) =>
            setForm({ ...form, warrantyText: e.target.value })
          }
        />

        <label style={styles.label}>Thông báo chung</label>
        <textarea
          style={{ ...styles.input, height: 90 }}
          value={form.noticeText}
          onChange={(e) =>
            setForm({ ...form, noticeText: e.target.value })
          }
        />

        <label style={styles.label}>Số Zalo hỗ trợ</label>
        <input
          style={styles.input}
          value={form.supportZalo}
          onChange={(e) =>
            setForm({ ...form, supportZalo: e.target.value })
          }
        />

        <label style={styles.label}>Link nhóm Zalo</label>
        <input
          style={styles.input}
          value={form.groupZalo}
          onChange={(e) =>
            setForm({ ...form, groupZalo: e.target.value })
          }
        />

        <button onClick={saveSettings} style={styles.saveBtn}>
          💾 Lưu cài đặt
        </button>
      </section>
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

      <a href="/admin/orders" style={styles.navBtn}>
        📋 Đơn hàng
      </a>

      <a href="/admin/users" style={styles.navBtn}>
        👤 Users
      </a>

      <a href="/admin/settings" style={styles.activeBtn}>
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

  box: {
    background: "#111827",
    padding: 20,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.12)",
  },

  label: {
    display: "block",
    marginTop: 12,
    marginBottom: 6,
    fontWeight: 700,
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,.15)",
    background: "#1e293b",
    color: "white",
    outline: "none",
  },

  saveBtn: {
    marginTop: 20,
    background: "#2563eb",
    color: "white",
    border: 0,
    padding: "12px 18px",
    borderRadius: 8,
    fontWeight: 800,
    cursor: "pointer",
  },
};