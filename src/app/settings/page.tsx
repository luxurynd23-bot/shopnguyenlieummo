"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function changePassword() {
    setMsg("");
    setError("");

    if (!oldPassword || !newPassword) {
      setError("Vui lòng nhập đầy đủ mật khẩu");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới tối thiểu 6 ký tự");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMsg(data.message || "Đổi mật khẩu thành công");
      setOldPassword("");
      setNewPassword("");
    } else {
      setError(data.message || "Đổi mật khẩu thất bại");
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <a href="/" style={styles.back}>← Về trang chủ</a>

        <section style={styles.card}>
          <h1 style={styles.title}>⚙️ Cài đặt tài khoản</h1>
          <p style={styles.desc}>Quản lý bảo mật tài khoản của bạn.</p>

          {msg && <div style={styles.success}>{msg}</div>}
          {error && <div style={styles.error}>{error}</div>}

          <label style={styles.label}>Mật khẩu cũ</label>
          <input
            type="password"
            placeholder="Nhập mật khẩu cũ"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            style={styles.input}
          />

          <label style={styles.label}>Mật khẩu mới</label>
          <input
            type="password"
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={styles.input}
          />

          <button
            onClick={changePassword}
            style={{
              ...styles.btn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
        </section>
      </div>
    </main>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f172a,#1e293b)",
    padding: 30,
    fontFamily: "Arial, sans-serif",
    color: "white",
  },
  wrap: {
    maxWidth: 520,
    margin: "0 auto",
  },
  back: {
    display: "inline-block",
    marginBottom: 18,
    color: "#cbd5e1",
    textDecoration: "none",
    fontWeight: 800,
  },
  card: {
    background: "#111827",
    padding: 24,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,.1)",
    boxShadow: "0 20px 50px rgba(0,0,0,.25)",
  },
  title: {
    margin: 0,
    fontSize: 28,
  },
  desc: {
    color: "#94a3b8",
    marginTop: 8,
    marginBottom: 20,
  },
  label: {
    display: "block",
    marginTop: 14,
    marginBottom: 8,
    fontWeight: 800,
    color: "#e5e7eb",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: 13,
    border: "1px solid rgba(255,255,255,.16)",
    borderRadius: 10,
    background: "#020617",
    color: "white",
    outline: "none",
  },
  btn: {
    width: "100%",
    marginTop: 18,
    background: "linear-gradient(90deg,#2563eb,#7c3aed)",
    color: "white",
    border: 0,
    borderRadius: 10,
    padding: "13px 16px",
    fontWeight: 900,
  },
  success: {
    background: "rgba(34,197,94,.15)",
    color: "#86efac",
    border: "1px solid rgba(34,197,94,.35)",
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  error: {
    background: "rgba(239,68,68,.15)",
    color: "#fecaca",
    border: "1px solid rgba(239,68,68,.35)",
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
};