"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function login() {
    setMsg("");

    if (!email.trim() || !password.trim()) {
      setMsg("Vui lòng nhập email và mật khẩu");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.message || "Đăng nhập thất bại");
        return;
      }

      const meRes = await fetch("/api/me", {
        credentials: "include",
        cache: "no-store",
      });

      const meData = await meRes.json();

      if (!meData.user) {
        setMsg("Đăng nhập thành công nhưng cookie chưa lưu. Hãy xoá cache trình duyệt rồi thử lại.");
        return;
      }

      window.location.href = "/";
    } catch (err: any) {
      setMsg("Lỗi kết nối máy chủ: " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={page}>
      <div style={card}>
        <h1 style={title}>ĐĂNG NHẬP</h1>

        <label style={label}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email"
          style={input}
        />

        <label style={label}>Mật khẩu</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu"
          style={input}
          onKeyDown={(e) => {
            if (e.key === "Enter") login();
          }}
        />

        {msg && <div style={errorBox}>{msg}</div>}

        <button onClick={login} disabled={loading} style={button}>
          {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
        </button>

        <p style={registerText}>
          Chưa có tài khoản? <a href="/register" style={registerLink}>Đăng ký</a>
        </p>
      </div>
    </main>
  );
}

const page: any = {
  minHeight: "100vh",
  background: "linear-gradient(135deg,#020617,#0f172a)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Arial",
};

const card: any = {
  width: 420,
  background: "#0f172a",
  color: "white",
  padding: 32,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,.15)",
};

const title: any = {
  textAlign: "center",
  fontSize: 32,
  marginBottom: 24,
};

const label: any = {
  display: "block",
  marginTop: 14,
  marginBottom: 8,
  fontWeight: 700,
};

const input: any = {
  width: "100%",
  height: 46,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,.2)",
  background: "#111827",
  color: "white",
  padding: "0 12px",
  fontSize: 15,
};

const errorBox: any = {
  marginTop: 16,
  background: "#7f1d1d",
  color: "white",
  padding: 12,
  borderRadius: 8,
  fontWeight: 700,
};

const button: any = {
  width: "100%",
  height: 50,
  marginTop: 22,
  border: 0,
  borderRadius: 8,
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
  background: "linear-gradient(90deg,#06b6d4,#ec4899)",
};

const registerText: any = {
  textAlign: "center",
  marginTop: 18,
};

const registerLink: any = {
  color: "#ec4899",
  fontWeight: 800,
};