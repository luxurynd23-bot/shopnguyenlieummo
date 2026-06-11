"use client";

import { useEffect, useState } from "react";

export default function RankingPage() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  async function loadData() {
    try {
      const meRes = await fetch("/api/me");
      const meData = await meRes.json();
      setUser(meData.user || null);

      const rankRes = await fetch("/api/rank");
      const rankData = await rankRes.json();
      setRanking(rankData.ranking || []);
    } catch {
      setRanking([]);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main style={page}>
      <aside style={sidebar}>
        <div style={logoBox}>
          <img src="/tiktok-logo.png" style={logoImg} />
          <div>
            <b style={logoText}>ShopMMO</b>
            <div style={domain}>shopmmo.info.vn</div>
          </div>
        </div>

        <nav style={nav}>
          <a href="/" style={navItem}>🏠 Trang Chủ</a>
          <a href="/" style={navItem}>🛒 Mua Tài Khoản</a>
          <a href="/orders" style={navItem}>↺ Lịch Sử Mua Hàng</a>
          <a href="/rank" style={navActive}>🏆 Bảng Xếp Hạng</a>
          <a href="/deposit" style={navItem}>🏦 Ngân Hàng</a>
          <a href="/deposit-history" style={navItem}>🧾 Hoá Đơn</a>
        </nav>
      </aside>

      <section style={main}>
        <header style={header}>
          <button style={menu}>☰</button>

          <div style={wallet}>
            💳 Ví: {(user?.balance || 0).toLocaleString("vi-VN")}đ
          </div>

          <div style={userBox}>
            🌙 🔔 🧔 {user?.name || user?.email || "Khách"}⌄
          </div>
        </header>

        <div style={content}>
          <h1 style={title}>Bảng Xếp Hạng Nạp Tiền</h1>

          <div style={table}>
            <div style={head}>
              <div>Xếp Hạng</div>
              <div>Thành Viên</div>
              <div>Tổng Nạp</div>
              <div>Vị Trí</div>
            </div>

            {ranking.map((u) => (
              <div key={u.rank} style={row}>
                <div style={rank}>{u.rank}</div>
                <div style={member}>{u.name}</div>
                <div style={money}>
                  {Number(u.amount || 0).toLocaleString("vi-VN")}đ
                </div>
                <div style={u.trend === "up" ? up : down}>
                  {u.trend === "up" ? "↑" : "↓"}
                </div>
              </div>
            ))}

            {ranking.length === 0 && (
              <div style={empty}>Chưa có dữ liệu nạp tiền.</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

const page: any = {
  minHeight: "100vh",
  background: "#080a0f",
  color: "white",
  display: "flex",
  fontFamily: "Arial, sans-serif",
};

const sidebar: any = {
  width: 250,
  background: "linear-gradient(180deg,#111318,#050608)",
  borderRight: "1px solid rgba(255,255,255,.08)",
  position: "fixed",
  top: 0,
  bottom: 0,
  left: 0,
};

const logoBox: any = {
  height: 82,
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "0 20px",
  borderBottom: "1px solid rgba(255,255,255,.08)",
};

const logoImg: any = {
  width: 56,
  height: 56,
  borderRadius: "50%",
  objectFit: "cover",
};

const logoText: any = {
  fontSize: 24,
};

const domain: any = {
  color: "#bfc5d1",
  fontSize: 13,
};

const nav: any = {
  display: "grid",
  gap: 8,
  paddingTop: 25,
};

const navItem: any = {
  color: "#cbd5e1",
  textDecoration: "none",
  padding: "14px 24px",
  fontWeight: 700,
};

const navActive: any = {
  color: "white",
  textDecoration: "none",
  padding: "14px 24px",
  fontWeight: 900,
  background: "linear-gradient(90deg,#22d3ee,#ff2b6d)",
  borderRadius: 8,
  margin: "0 10px",
  boxShadow: "0 0 25px rgba(255,43,109,.45)",
};

const main: any = {
  marginLeft: 250,
  width: "calc(100% - 250px)",
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top right,rgba(236,72,153,.15),transparent 25%), radial-gradient(circle at top left,rgba(34,211,238,.12),transparent 25%), #080a0f",
};

const header: any = {
  height: 78,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 30px",
  borderBottom: "1px solid rgba(255,255,255,.08)",
  background: "rgba(10,12,18,.9)",
};

const menu: any = {
  background: "transparent",
  border: 0,
  color: "#9ca3af",
  fontSize: 28,
};

const wallet: any = {
  border: "1px solid #22d3ee",
  color: "#22d3ee",
  padding: "9px 16px",
  borderRadius: 8,
  fontWeight: 900,
};

const userBox: any = {
  color: "#e5e7eb",
  fontWeight: 800,
};

const content: any = {
  padding: 32,
};

const title: any = {
  fontSize: 28,
  marginBottom: 25,
};

const table: any = {
  borderRadius: 10,
  overflow: "hidden",
  borderLeft: "1px solid #22d3ee",
  borderRight: "2px solid #ff2b6d",
  boxShadow: "0 0 35px rgba(34,211,238,.12)",
  background: "rgba(255,255,255,.025)",
};

const head: any = {
  display: "grid",
  gridTemplateColumns: "1fr 1.8fr 1.8fr 1fr",
  padding: "18px 28px",
  background: "rgba(255,255,255,.06)",
  fontWeight: 900,
  color: "#d1d5db",
};

const row: any = {
  display: "grid",
  gridTemplateColumns: "1fr 1.8fr 1.8fr 1fr",
  padding: "17px 28px",
  borderTop: "1px solid rgba(255,255,255,.07)",
  alignItems: "center",
};

const rank: any = {
  color: "#ff2b6d",
  fontWeight: 900,
  textAlign: "center",
};

const member: any = {
  fontWeight: 800,
};

const money: any = {
  color: "#22d3ee",
  fontWeight: 900,
};

const up: any = {
  color: "#22d3ee",
  fontSize: 26,
  textAlign: "center",
};

const down: any = {
  color: "#ff2b6d",
  fontSize: 26,
  textAlign: "center",
};

const empty: any = {
  padding: 30,
  textAlign: "center",
  color: "#cbd5e1",
};
