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
        headers: { "Content-Type": "application/json" },
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
    return <div style={{ padding: 30 }}>Đang tải cài đặt...</div>;
  }

  return (
    <main style={{ padding: 30, fontFamily: "Arial", minHeight: "100vh", background: "#f3f6fb" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 24 }}>Cài đặt Shop</h1>

      <section style={boxStyle}>
        <label>Tên shop</label>
        <input
          style={inputStyle}
          value={form.shopName}
          onChange={(e) => setForm({ ...form, shopName: e.target.value })}
        />

        <label>Domain shop</label>
        <input
          style={inputStyle}
          value={form.shopDomain}
          onChange={(e) => setForm({ ...form, shopDomain: e.target.value })}
        />

        <label>Thông báo bảo hành</label>
        <textarea
          style={{ ...inputStyle, height: 80 }}
          value={form.warrantyText}
          onChange={(e) => setForm({ ...form, warrantyText: e.target.value })}
        />

        <label>Thông báo chung (Notice)</label>
        <textarea
          style={{ ...inputStyle, height: 80 }}
          value={form.noticeText}
          onChange={(e) => setForm({ ...form, noticeText: e.target.value })}
        />

        <label>Số Zalo hỗ trợ</label>
        <input
          style={inputStyle}
          value={form.supportZalo}
          onChange={(e) => setForm({ ...form, supportZalo: e.target.value })}
        />

        <label>Link nhóm Zalo</label>
        <input
          style={inputStyle}
          value={form.groupZalo}
          onChange={(e) => setForm({ ...form, groupZalo: e.target.value })}
        />

        <button onClick={saveSettings} style={buttonStyle}>
          Lưu cài đặt
        </button>
      </section>
    </main>
  );
}

const boxStyle: any = {
  background: "white",
  padding: 20,
  borderRadius: 10,
  marginBottom: 25,
  boxShadow: "0 4px 14px rgba(0,0,0,.08)",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const inputStyle: any = {
  display: "block",
  width: "100%",
  padding: 12,
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  marginBottom: 10,
};

const buttonStyle: any = {
  marginTop: 12,
  background: "#2563eb",
  color: "white",
  border: 0,
  padding: "12px 18px",
  borderRadius: 8,
  fontWeight: 800,
  cursor: "pointer",
};