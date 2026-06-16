"use client";

import { useEffect, useState } from "react";

export default function ReferralPage() {
  const [user, setUser] = useState<any>(null);
  const [top, setTop] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  async function loadReferral() {
    const res = await fetch("/api/referral");
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    }
  }

  async function loadTop() {
    const res = await fetch("/api/referral/top");
    if (res.ok) {
      const data = await res.json();
      setTop(data.topReferrals || []);
    }
  }

  async function loadHistory() {
    const res = await fetch("/api/referral/history");
    if (res.ok) {
      const data = await res.json();
      setHistory(data.items || data.history || []);
    }
  }

  useEffect(() => {
    loadReferral();
    loadTop();
    loadHistory();
  }, []);

  async function withdrawReferral() {
    const res = await fetch("/api/referral/withdraw", { method: "POST" });
    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      loadReferral();
      loadHistory();
    }
  }

  const referralLink =
    typeof window !== "undefined" && user?.referralCode
      ? `${window.location.origin}/register?ref=${user.referralCode}`
      : "";

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🎁 Giới thiệu bạn bè</h1>
          <p style={styles.subTitle}>
            Chia sẻ link giới thiệu và nhận hoa hồng 5% khi bạn bè nạp tiền.
          </p>
        </div>

        <a href="/" style={styles.homeBtn}>
          ← Trang chủ
        </a>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Mã giới thiệu</div>

          <div style={styles.bigCode}>
            {user?.referralCode || "Đang tải..."}
          </div>

          <div style={styles.linkBox}>
            {referralLink || "Đang tạo link..."}
          </div>

          <div style={styles.btnRow}>
            <button
              style={styles.btn}
              onClick={() => {
                navigator.clipboard.writeText(user?.referralCode || "");
                alert("Đã copy mã");
              }}
            >
              Copy mã
            </button>

            <button
              style={styles.btnPink}
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                alert("Đã copy link giới thiệu");
              }}
            >
              Copy link
            </button>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statValue}>{user?.referralCount || 0}</div>
          <div style={styles.statLabel}>Người đã giới thiệu</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>💸</div>
          <div style={styles.statValue}>
            {Number(user?.referralBalance || 0).toLocaleString("vi-VN")}đ
          </div>
          <div style={styles.statLabel}>Hoa hồng tích lũy</div>

          <button style={styles.withdrawBtn} onClick={withdrawReferral}>
            Rút về số dư
          </button>
        </div>
      </div>

      <div style={styles.guideBox}>
        <h2 style={styles.boxTitle}>📌 Cách hoạt động</h2>
        <div style={styles.stepGrid}>
          <div style={styles.step}>1️⃣ Copy link giới thiệu</div>
          <div style={styles.step}>2️⃣ Gửi cho bạn bè đăng ký</div>
          <div style={styles.step}>3️⃣ Bạn bè nạp tiền</div>
          <div style={styles.step}>4️⃣ Bạn nhận 5% hoa hồng</div>
        </div>
      </div>

      <div style={styles.twoCol}>
        <div style={styles.topBox}>
          <h2 style={styles.boxTitle}>🏆 TOP GIỚI THIỆU</h2>

          {top.length === 0 && (
            <p style={styles.empty}>Chưa có dữ liệu.</p>
          )}

          {top.map((item, index) => (
            <div key={item.id} style={styles.topRow}>
              <span>
                {index === 0
                  ? "🥇"
                  : index === 1
                  ? "🥈"
                  : index === 2
                  ? "🥉"
                  : "🏅"}{" "}
                {item.user}
              </span>

              <b>{item.count} người</b>
            </div>
          ))}
        </div>

        <div style={styles.topBox}>
          <h2 style={styles.boxTitle}>📜 LỊCH SỬ HOA HỒNG</h2>

          {history.length === 0 && (
            <p style={styles.empty}>Chưa có lịch sử hoa hồng.</p>
          )}

          {history.map((item) => (
            <div key={item.id} style={styles.historyRow}>
              <div>
                <b>{new Date(item.createdAt).toLocaleString("vi-VN")}</b>
                <div style={styles.historySub}>
                  {item.referredUser?.email
                    ? `Từ: ${item.referredUser.email}`
                    : `Nạp: ${Number(item.amount || 0).toLocaleString("vi-VN")}đ`}
                </div>
              </div>

              <b style={{ color: "#22c55e" }}>
                +{Number(item.commission || 0).toLocaleString("vi-VN")}đ
              </b>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top right,rgba(236,72,153,.16),transparent 30%), radial-gradient(circle at top left,rgba(34,211,238,.14),transparent 28%), #0f172a",
    color: "white",
    padding: 30,
    fontFamily: "Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    marginBottom: 24,
  },

  title: {
    margin: 0,
    fontSize: 34,
    fontWeight: 900,
  },

  subTitle: {
    color: "#cbd5e1",
    marginTop: 8,
    fontWeight: 700,
  },

  homeBtn: {
    color: "white",
    textDecoration: "none",
    background: "linear-gradient(90deg,#06b6d4,#ec4899)",
    padding: "12px 16px",
    borderRadius: 10,
    fontWeight: 900,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: 20,
    marginBottom: 24,
  },

  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },

  card: {
    background:
      "linear-gradient(135deg,rgba(17,24,39,.96),rgba(15,23,42,.96))",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 16,
    padding: 22,
    boxShadow: "0 18px 50px rgba(0,0,0,.25)",
  },

  cardTitle: {
    color: "#93c5fd",
    fontWeight: 900,
    marginBottom: 10,
  },

  bigCode: {
    fontSize: 42,
    fontWeight: 900,
    color: "#22d3ee",
    letterSpacing: 3,
    marginBottom: 14,
  },

  linkBox: {
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 10,
    padding: 12,
    color: "#e5e7eb",
    wordBreak: "break-all",
    marginBottom: 14,
  },

  btnRow: {
    display: "flex",
    gap: 10,
  },

  btn: {
    background: "#2563eb",
    color: "white",
    border: 0,
    borderRadius: 8,
    padding: "11px 16px",
    fontWeight: 900,
    cursor: "pointer",
  },

  btnPink: {
    background: "#ec4899",
    color: "white",
    border: 0,
    borderRadius: 8,
    padding: "11px 16px",
    fontWeight: 900,
    cursor: "pointer",
  },

  statCard: {
    background:
      "linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.025))",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 16,
    padding: 22,
    textAlign: "center",
    boxShadow: "0 18px 50px rgba(0,0,0,.25)",
  },

  statIcon: {
    fontSize: 34,
    marginBottom: 10,
  },

  statValue: {
    fontSize: 28,
    fontWeight: 900,
    color: "#22d3ee",
  },

  statLabel: {
    color: "#cbd5e1",
    marginTop: 8,
    fontWeight: 800,
  },

  withdrawBtn: {
    marginTop: 16,
    background: "#22c55e",
    color: "white",
    border: 0,
    borderRadius: 8,
    padding: "11px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },

  guideBox: {
    background: "#111827",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 16,
    padding: 22,
    marginBottom: 24,
  },

  boxTitle: {
    marginTop: 0,
    fontWeight: 900,
  },

  stepGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 12,
  },

  step: {
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 10,
    padding: 14,
    fontWeight: 800,
    textAlign: "center",
  },

  topBox: {
    background: "#111827",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 16,
    padding: 22,
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "13px 0",
    borderBottom: "1px solid rgba(255,255,255,.08)",
    fontWeight: 800,
  },

  historyRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "13px 0",
    borderBottom: "1px solid rgba(255,255,255,.08)",
  },

  historySub: {
    color: "#cbd5e1",
    marginTop: 4,
    fontSize: 14,
  },

  empty: {
    color: "#cbd5e1",
  },
};