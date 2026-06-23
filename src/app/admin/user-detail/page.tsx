"use client";

import { useEffect, useState } from "react";

export default function AdminUserDetailPage() {
  const [userId, setUserId] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!userId.trim()) {
      alert("Nhập userId trước");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/admin/user-detail?userId=${userId}`);
      const json = await res.json();

      if (!res.ok) {
        alert(json.message || "Lỗi tải user");
        setData(null);
      } else {
        setData(json);
      }
    } catch {
      alert("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <a href="/" style={styles.back}>← Về trang chủ</a>

      <h1>👤 Admin - Chi tiết user</h1>

      <div style={styles.searchRow}>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Dán User ID vào đây..."
          style={styles.input}
        />

        <button onClick={load} style={styles.btn}>
          {loading ? "Đang tải..." : "Xem user"}
        </button>
      </div>

      {data && (
        <>
          <div style={styles.cards}>
            <Card title="Email" value={data.user.email} />
            <Card title="Số dư" value={`${data.user.balance.toLocaleString("vi-VN")}đ`} />
            <Card title="Tổng nạp" value={`${data.summary.totalDeposit.toLocaleString("vi-VN")}đ`} />
            <Card title="Tổng mua" value={`${data.summary.totalBuy.toLocaleString("vi-VN")}đ`} />
            <Card title="Tổng check" value={`${data.summary.totalCheckCost.toLocaleString("vi-VN")}đ`} />
            <Card title="Lợi nhuận MVD" value={`${data.summary.totalCheckProfit.toLocaleString("vi-VN")}đ`} />
          </div>

          <Section title="🛒 Lịch sử mua hàng">
            <pre style={styles.pre}>
              {data.orders.map((o: any) =>
                `${new Date(o.createdAt).toLocaleString("vi-VN")} | ${o.productName} | ${Number(o.amount).toLocaleString("vi-VN")}đ\n${(o.items || []).map((i: any) => i.content).join("\n")}`
              ).join("\n\n")}
            </pre>
          </Section>

          <Section title="📦 Lịch sử check MVD">
            <pre style={styles.pre}>
              {data.checks.map((c: any) =>
                `${new Date(c.createdAt).toLocaleString("vi-VN")} | ${c.trackingNo || "Không MVD"} | ${c.shopName || ""} | ${Number(c.cost || 0).toLocaleString("vi-VN")}đ`
              ).join("\n")}
            </pre>
          </Section>

          <Section title="💳 Lịch sử nạp">
            <pre style={styles.pre}>
              {data.deposits.map((d: any) =>
                `${new Date(d.createdAt).toLocaleString("vi-VN")} | ${Number(d.amount).toLocaleString("vi-VN")}đ | ${d.status} | ${d.note}`
              ).join("\n")}
            </pre>
          </Section>
        </>
      )}
    </main>
  );
}

function Card({ title, value }: any) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value}</div>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <section style={styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    padding: 24,
    fontFamily: "Arial",
  },
  back: {
    color: "#22d3ee",
    textDecoration: "none",
    fontWeight: 900,
  },
  searchRow: {
    display: "flex",
    gap: 10,
    margin: "20px 0",
  },
  input: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#020617",
    color: "white",
  },
  btn: {
    padding: "14px 20px",
    borderRadius: 10,
    border: 0,
    background: "#2563eb",
    color: "white",
    fontWeight: 900,
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 14,
    marginBottom: 20,
  },
  card: {
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 900,
    color: "#22d3ee",
  },
  section: {
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
  },
  pre: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    color: "#e5e7eb",
  },
};