"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Đăng nhập thành công");
        window.location.href = "/";
      } else {
        alert(data.message || "Đăng nhập thất bại");
      }
    } catch {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={page}>
      <div style={bgCircle1}></div>
      <div style={bgCircle2}></div>
      <div style={dotBox}></div>

      <div style={card}>
        <div style={logoWrap}>
          <div style={logoCircle}>
            <img src="/tiktok-logo.png" alt="logo" style={logoImg} />
          </div>
        </div>

        <h1 style={title}>ĐĂNG NHẬP</h1>
        <p style={subTitle}>Đăng nhập để tiếp tục mua hàng</p>

        <label style={label}>👤 Email đăng nhập</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email của bạn"
          style={input}
        />

        <div style={labelRow}>
          <label style={labelNoMargin}>🔒 Mật khẩu</label>
          <a href="#" style={forgotLink}>Quên mật khẩu?</a>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu"
          style={input}
        />

        <button onClick={login} disabled={loading} style={button}>
          {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
        </button>

        <p style={registerText}>
          Bạn chưa có tài khoản?{" "}
          <a href="/register" style={registerLink}>
            Đăng ký
          </a>
        </p>
      </div>
    </main>
  );
}

const page: any = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, #0ea5e9 0, transparent 28%), radial-gradient(circle at bottom right, #ec4899 0, transparent 25%), linear-gradient(135deg, #020617, #030712 55%, #0f172a)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Arial, sans-serif",
  position: "relative",
  overflow: "hidden",
  padding: 24,
};

const bgCircle1: any = {
  position: "absolute",
  width: 260,
  height: 260,
  borderRadius: "50%",
  background: "rgba(34,211,238,.15)",
  left: 80,
  top: 180,
  filter: "blur(20px)",
};

const bgCircle2: any = {
  position: "absolute",
  width: 300,
  height: 300,
  borderRadius: "50%",
  background: "rgba(236,72,153,.12)",
  right: 120,
  bottom: 120,
  filter: "blur(18px)",
};

const dotBox: any = {
  position: "absolute",
  right: 250,
  top: 170,
  width: 90,
  height: 90,
  backgroundImage:
    "radial-gradient(circle, rgba(59,130,246,.9) 2px, transparent 3px)",
  backgroundSize: "18px 18px",
  opacity: 0.7,
};

const card: any = {
  width: 430,
  background: "rgba(15,23,42,.78)",
  border: "2px solid transparent",
  borderImage: "linear-gradient(180deg,#22d3ee,#ec4899) 1",
  borderRadius: 28,
  padding: 36,
  color: "white",
  boxShadow: "0 30px 80px rgba(0,0,0,.45)",
  backdropFilter: "blur(18px)",
  zIndex: 2,
};

const logoWrap: any = {
  display: "flex",
  justifyContent: "center",
  marginBottom: 14,
};

const logoCircle: any = {
  width: 115,
  height: 115,
  borderRadius: "50%",
  background: "linear-gradient(145deg,#111827,#000)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 15px 30px rgba(0,0,0,.45)",
};

const logoImg: any = {
  width: 86,
  height: 86,
  objectFit: "contain",
  filter: "drop-shadow(0 0 12px #22d3ee)",
};

const title: any = {
  textAlign: "center",
  fontSize: 34,
  fontWeight: 900,
  margin: "10px 0 6px",
  letterSpacing: 1,
};

const subTitle: any = {
  textAlign: "center",
  color: "#cbd5e1",
  marginBottom: 26,
};

const label: any = {
  display: "block",
  marginBottom: 8,
  marginTop: 14,
  color: "#e5e7eb",
  fontWeight: 700,
};

const labelRow: any = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 14,
  marginBottom: 8,
};

const labelNoMargin: any = {
  color: "#e5e7eb",
  fontWeight: 700,
};

const forgotLink: any = {
  color: "#60a5fa",
  fontSize: 13,
  textDecoration: "none",
  fontWeight: 700,
};

const input: any = {
  width: "100%",
  height: 48,
  background: "rgba(255,255,255,.08)",
  border: "1px solid rgba(255,255,255,.13)",
  borderRadius: 10,
  padding: "0 14px",
  color: "white",
  outline: "none",
  fontSize: 15,
};

const button: any = {
  width: "100%",
  height: 52,
  border: 0,
  borderRadius: 10,
  marginTop: 28,
  color: "white",
  fontSize: 17,
  fontWeight: 900,
  cursor: "pointer",
  background: "linear-gradient(90deg,#06b6d4,#3b82f6,#ec4899)",
  boxShadow: "0 12px 25px rgba(59,130,246,.35)",
};

const registerText: any = {
  textAlign: "center",
  marginTop: 20,
  color: "#e5e7eb",
};

const registerLink: any = {
  color: "#ec4899",
  fontWeight: 800,
  textDecoration: "none",
};
