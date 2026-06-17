"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();
      setStats(res.ok ? data : null);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function money(value: any) {
    return Number(value || 0).toLocaleString("vi-VN") + "đ";
  }

  const revenueByDay = stats?.revenueByDay || [];
  const maxRevenue = Math.max(
    1,
    ...revenueByDay.map((r: any) => Number(r.total || 0))
  );

  if (loading) {
    return (
      <main style={styles.page}>
        <AdminNav />
        <div style={styles.loadingBox}>⏳ Đang tải dashboard...</div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main style={styles.page}>
        <AdminNav />
        <div style={styles.errorBox}>❌ Không thể tải dữ liệu dashboard.</div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <AdminNav />

      <div style={styles.headerBox}>
        <div>
          <h1 style={styles.title}>📊 Dashboard Admin</h1>
          <div style={styles.subTitle}>Tổng quan hệ thống shop MMO</div>
        </div>

        <button onClick={loadDashboard} style={styles.reloadBtn}>
          ↻ Tải lại
        </button>
      </div>

      <div style={styles.grid}>
        <StatCard icon="👤" title="Tổng người dùng" value={stats.totalUsers} />
        <StatCard icon="🛒" title="Tổng đơn hàng" value={stats.totalOrders} />
        <StatCard icon="💰" title="Doanh thu" value={money(stats.totalRevenue)} />
        <StatCard icon="🏦" title="Tiền nạp" value={money(stats.totalDeposit)} />
        <StatCard icon="📦" title="Kho còn" value={stats.stockLeft} />
        <StatCard icon="🎫" title="Ticket mở" value={stats.openTickets || 0} />
        <StatCard icon="🎁" title="Hoa hồng" value={money(stats.totalCommission)} />
        <StatCard icon="🎟" title="Coupon đã giảm" value={money(stats.totalCouponDiscount)} />
        <StatCard icon="🚚" title="Doanh thu Check MVD" value={money(stats.totalCheckRevenue)} />
        <StatCard icon="📈" title="Lợi nhuận Check MVD" value={money(stats.totalCheckProfit)} />
      </div>

      <div style={styles.twoCol}>
        <div style={styles.box}>
          <h2 style={styles.boxTitle}>🔥 Top sản phẩm bán chạy</h2>

          {(stats.topProducts || []).length === 0 && (
            <div style={styles.empty}>Chưa có dữ liệu.</div>
          )}

          {(stats.topProducts || []).map((p: any, index: number) => (
            <div key={index} style={styles.listRow}>
              <div>
                <b>
                  #{index + 1} {p.productName}
                </b>
                <div style={styles.smallText}>{p.count} đơn hàng</div>
              </div>
              <b style={{ color: "#22c55e" }}>{money(p.revenue)}</b>
            </div>
          ))}
        </div>

        <div style={styles.box}>
          <h2 style={styles.boxTitle}>👑 Top khách hàng</h2>

          {(stats.topUsers || []).length === 0 && (
            <div style={styles.empty}>Chưa có dữ liệu.</div>
          )}

          {(stats.topUsers || []).map((u: any, index: number) => (
            <div key={u.id || index} style={styles.listRow}>
              <div>
                <b>
                  #{index + 1} {u.user}
                </b>
                <div style={styles.smallText}>VIP: {u.vipLevel || "BRONZE"}</div>
              </div>
              <b style={{ color: "#22d3ee" }}>{money(u.totalDeposit)}</b>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.twoCol}>
        <div style={styles.box}>
          <h2 style={styles.boxTitle}>⚡ Thống kê nhanh</h2>

          <div style={styles.quickGrid}>
            <QuickItem label="User" value={stats.totalUsers} />
            <QuickItem label="Đơn hàng" value={stats.totalOrders} />
            <QuickItem label="Doanh thu" value={money(stats.totalRevenue)} />
            <QuickItem label="Tiền nạp" value={money(stats.totalDeposit)} />
            <QuickItem label="Kho còn" value={stats.stockLeft} />
            <QuickItem label="Ticket mở" value={stats.openTickets || 0} />
            <QuickItem label="Hoa hồng" value={money(stats.totalCommission)} />
            <QuickItem label="Coupon giảm" value={money(stats.totalCouponDiscount)} />
            <QuickItem label="Check MVD" value={money(stats.totalCheckRevenue)} />
            <QuickItem label="Lãi MVD" value={money(stats.totalCheckProfit)} />
          </div>
        </div>

        <div style={styles.box}>
          <h2 style={styles.boxTitle}>📌 Trạng thái hệ thống</h2>

          <div style={styles.statusRow}>
            <span>🟢 Website</span>
            <b>Online</b>
          </div>

          <div style={styles.statusRow}>
            <span>💳 PayOS</span>
            <b>Đang chạy</b>
          </div>

          <div style={styles.statusRow}>
            <span>📦 Giao hàng</span>
            <b>Tự động</b>
          </div>

          <div style={styles.statusRow}>
            <span>🎫 Hỗ trợ</span>
            <b>{stats.openTickets || 0} ticket mở</b>
          </div>
        </div>
      </div>

      <div style={styles.box}>
        <h2 style={styles.boxTitle}>📈 Doanh thu theo ngày</h2>

        {revenueByDay.length === 0 && (
          <div style={styles.empty}>Chưa có dữ liệu doanh thu.</div>
        )}

        {revenueByDay.map((x: any) => {
          const percent = Math.min(
            100,
            (Number(x.total || 0) / maxRevenue) * 100
          );

          return (
            <div key={x.day} style={styles.dayRow}>
              <div style={styles.dayTop}>
                <b>{x.day}</b>
                <b>{money(x.total)}</b>
              </div>

              <div style={styles.progressBg}>
                <div style={{ ...styles.progressFill, width: percent + "%" }} />
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function StatCard({ icon, title, value }: any) {
  return (
    <div style={styles.card}>
      <div style={styles.cardIcon}>{icon}</div>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value}</div>
    </div>
  );
}

function QuickItem({ label, value }: any) {
  return (
    <div style={styles.quickItem}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function AdminNav() {
  return (
    <div style={styles.nav}>
      <a href="/" style={styles.homeBtn}>← Trang chủ</a>
      <a href="/admin/dashboard" style={styles.activeBtn}>📊 Dashboard</a>
      <a href="/admin" style={styles.navBtn}>📦 Sản phẩm</a>
      <a href="/admin/stock" style={styles.navBtn}>📥 Kho</a>
      <a href="/admin/orders" style={styles.navBtn}>📋 Đơn hàng</a>
      <a href="/admin/users" style={styles.navBtn}>👤 Users</a>
      <a href="/admin/tickets" style={styles.navBtn}>🎫 Tickets</a>
      <a href="/admin/coupons" style={styles.navBtn}>🎟 Coupon</a>
      <a href="/admin/settings" style={styles.navBtn}>⚙️ Cài đặt</a>
    </div>
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
  nav: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 22,
    padding: 14,
    borderRadius: 14,
    background: "rgba(15,23,42,.85)",
    border: "1px solid rgba(255,255,255,.12)",
    boxShadow: "0 20px 60px rgba(0,0,0,.25)",
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
    border: "1px solid rgba(255,255,255,.1)",
  },
  activeBtn: {
    background: "#2563eb",
    color: "white",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: 8,
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,.2)",
  },
  headerBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
    gap: 14,
  },
  title: {
    fontSize: 34,
    margin: 0,
    fontWeight: 900,
  },
  subTitle: {
    color: "#cbd5e1",
    marginTop: 6,
    fontWeight: 700,
  },
  reloadBtn: {
    background: "linear-gradient(90deg,#06b6d4,#ec4899)",
    color: "white",
    border: 0,
    padding: "12px 16px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 900,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
    gap: 18,
    marginBottom: 24,
  },
  card: {
    background:
      "linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.025))",
    padding: 20,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,.12)",
    boxShadow: "0 18px 50px rgba(0,0,0,.22)",
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "#93c5fd",
  },
  cardValue: {
    fontSize: 26,
    fontWeight: 900,
    color: "#22d3ee",
    marginTop: 8,
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginBottom: 24,
  },
  box: {
    background:
      "linear-gradient(135deg,rgba(17,24,39,.96),rgba(15,23,42,.96))",
    padding: 22,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,.12)",
    marginBottom: 24,
    boxShadow: "0 18px 50px rgba(0,0,0,.22)",
  },
  boxTitle: {
    marginTop: 0,
    marginBottom: 18,
    fontWeight: 900,
  },
  listRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "13px 0",
    borderBottom: "1px solid rgba(255,255,255,.08)",
  },
  smallText: {
    color: "#94a3b8",
    marginTop: 4,
    fontSize: 14,
  },
  quickGrid: {
    display: "grid",
    gap: 12,
  },
  quickItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 14px",
    background: "rgba(255,255,255,.05)",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,.08)",
  },
  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "13px 0",
    borderBottom: "1px solid rgba(255,255,255,.08)",
  },
  empty: {
    color: "#cbd5e1",
    padding: "10px 0",
  },
  dayRow: {
    marginTop: 16,
  },
  dayTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressBg: {
    height: 14,
    background: "#334155",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg,#06b6d4,#ec4899)",
    borderRadius: 999,
  },
  loadingBox: {
    padding: 20,
    borderRadius: 12,
    background: "#111827",
    border: "1px solid rgba(255,255,255,.12)",
    fontWeight: 900,
  },
  errorBox: {
    padding: 20,
    borderRadius: 12,
    background: "#7f1d1d",
    border: "1px solid rgba(255,255,255,.12)",
    fontWeight: 900,
  },
};