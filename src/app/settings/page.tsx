"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  async function changePassword() {
    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Đổi mật khẩu thành công");
      setOldPassword("");
      setNewPassword("");
    } else {
      alert(data.message || "Đổi mật khẩu thất bại");
    }
  }

  return (
    <main style={{ padding: 30, fontFamily: "Arial", background: "#f3f6fb", minHeight: "100vh" }}>
      <h1>Cài đặt tài khoản</h1>

      <div style={{ marginBottom: 20 }}>
        <a href="/">← Về trang chủ</a>
      </div>

      <section style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        maxWidth: 460,
        boxShadow: "0 6px 18px rgba(0,0,0,.08)"
      }}>
        <h2>Đổi mật khẩu</h2>

        <input
          type="password"
          placeholder="Mật khẩu cũ"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          style={input}
        />

        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={input}
        />

        <button onClick={changePassword} style={btn}>
          Đổi mật khẩu
        </button>
      </section>
    </main>
  );
}

const input: any = {
  width: "100%",
  padding: 12,
  marginTop: 10,
  border: "1px solid #cbd5e1",
  borderRadius: 8,
};

const btn: any = {
  marginTop: 12,
  background: "#2563eb",
  color: "white",
  border: 0,
  borderRadius: 8,
  padding: "12px 16px",
  fontWeight: 800,
  cursor: "pointer",
};