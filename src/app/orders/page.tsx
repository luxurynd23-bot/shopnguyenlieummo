"use client";

import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");
  const [user, setUser] = useState<any>(null);

  async function loadData() {
    try {
      const meRes = await fetch("/api/me");
      const meData = await meRes.json();
      setUser(meData.user || null);

      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const filteredOrders = orders.filter((o) => {
    const text = `${o.id} ${o.product} ${o.amount}`.toLowerCase();
    return text.includes(keyword.toLowerCase());
  });

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logoBox}>
          <img src="/tiktok-logo.png" style={styles.logoImg} />
          <div>
            <div style={styles.logoText}>ShopMMO</div>
            <div style={styles.logoDomain}>shopmmo.info.vn</div>
          </div>
        </div>

        <div style={styles.sideInfo}>🌐 Ngôn ngữ: <b>Vietnamese⌄</b></div>
        <div style={styles.sideInfo}>$ Tiền tệ: <b>VND⌄</b></div>

        <div style={styles.balance}>
          Số dư: <b style={{ color: "#00e5ff" }}>
            {(user?.balance || 0).toLocaleString("vi-VN")}đ
          </b>{" "}
          - GIẢM: <b style={{ color: "#ff2b6d" }}>0%</b>
        </div>

        <nav style={styles.nav}>
          <a href="/" style={styles.navItem}>🏠 Trang Chủ</a>
          <a href="/" style={styles.navItem}>🛒 Mua Tài Khoản</a>
          <a href="/orders" style={styles.navActive}>↺ Lịch Sử Mua Hàng</a>
          <a href="/deposit" style={styles.navItem}>🏦 Ngân Hàng</a>
          <a href="/deposit-history" style={styles.navItem}>🧾 Hoá Đơn</a>
          <a href="/settings" style={styles.navItem}>⚙️ Cài Đặt</a>
          <button onClick={logout} style={styles.logoutBtn}>↪ Đăng xuất</button>
        </nav>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <button style={styles.menuBtn}>☰</button>

          <div style={styles.balanceTop}>
            💳 Ví: {(user?.balance || 0).toLocaleString("vi-VN")}đ
          </div>

          <div style={styles.userArea}>
            <button style={styles.circleBtn}>☼</button>
            <button style={styles.circleBtn}>☾</button>
            <div style={styles.bell}>🔔<span style={styles.badge}>3</span></div>
            <div style={styles.avatar}>
              {(user?.name || user?.email || "T").charAt(0).toUpperCase()}
            </div>
            <b>{user?.name || user?.email || "Khách"}</b>
          </div>
        </header>

        <section style={styles.content}>
          <div style={styles.notice}>
            <div style={styles.noticeIcon}>🛒</div>
            <div>
              <p>Đơn hàng sau khi mua sẽ gửi về email hay cập nhật đúng email để nhận thông tin và lưu trữ.</p>
              <b style={{ color: "#ff2b6d" }}>⛔ TẤT CẢ ĐƠN HÀNG TRÊN WEB SẼ BỊ XÓA SAU 7 NGÀY</b>
            </div>
          </div>

          <a href="/" style={styles.backBtn}>← Quay Lại</a>

          <div style={styles.box}>
            <h2 style={styles.title}>Lịch Sử Mua Hàng</h2>

            <div style={styles.toolRow}>
              <div>
                Show{" "}
                <select style={styles.select}>
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>{" "}
                entries
              </div>

              <div>
                Search:{" "}
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm kiếm..."
                  style={styles.search}
                />
              </div>
            </div>

            <div style={styles.table}>
              <div style={styles.head}>
                <div>#</div>
                <div>Mã giao dịch</div>
                <div>Sản phẩm</div>
                <div>Số lượng</div>
                <div>Thanh toán</div>
                <div>Thời gian</div>
                <div>Thao tác</div>
              </div>

              {filteredOrders.map((o, i) => (
                <div key={o.id} style={styles.row}>
                  <div>{i + 1}</div>
                  <div style={styles.code}>{String(o.id).slice(-12).toUpperCase()}</div>
                  <div style={styles.product}>{o.product}</div>
                  <div style={styles.qty}>{o.quantity || 1}</div>
                  <div style={styles.money}>{Number(o.amount || 0).toLocaleString("vi-VN")}đ</div>
                  <div>{new Date(o.createdAt).toLocaleString("vi-VN")}</div>
                  <div style={styles.actions}>
                    <a href={`/orders/${o.id}`} style={styles.viewBtn}>Xem Thêm</a>
                    <a href={`/orders/${o.id}`} style={styles.downloadBtn}>Tải Về</a>
                  </div>
                </div>
              ))}

              {filteredOrders.length === 0 && (
                <div style={styles.empty}>Không tìm thấy đơn hàng.</div>
              )}
            </div>

            <div style={styles.footer}>
              <span>
                Showing {filteredOrders.length > 0 ? 1 : 0} to {filteredOrders.length} of {filteredOrders.length} entries
              </span>

              <div style={styles.pagination}>
                <button style={styles.pageBtn}>Previous</button>
                <button style={styles.pageActive}>1</button>
                <button style={styles.pageBtn}>Next</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#080a0f",
    color: "#e5e7eb",
    fontFamily: "Arial, sans-serif",
    display: "flex",
  },
  sidebar: {
    width: 250,
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    background: "linear-gradient(180deg,#101216,#050608)",
    borderRight: "1px solid rgba(255,255,255,.08)",
  },
  logoBox: {
    height: 78,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 18px",
    borderBottom: "1px solid rgba(255,255,255,.08)",
  },
  logoImg: {
    width: 54,
    height: 54,
    borderRadius: 12,
    objectFit: "cover",
    border: "1px solid #22d3ee",
  },
  logoText: {
    fontSize: 24,
    fontWeight: 900,
    color: "white",
  },
  logoDomain: {
    fontSize: 12,
    color: "#cbd5e1",
  },
  sideInfo: {
    padding: "13px 22px",
    color: "#d1d5db",
    fontSize: 14,
  },
  balance: {
    padding: "18px 22px",
    fontSize: 14,
    borderBottom: "1px solid rgba(255,255,255,.06)",
  },
  nav: {
    display: "grid",
    gap: 6,
    paddingTop: 10,
  },
  navItem: {
    color: "#d1d5db",
    textDecoration: "none",
    padding: "13px 22px",
    fontWeight: 700,
  },
  navActive: {
    color: "white",
    textDecoration: "none",
    padding: "13px 22px",
    fontWeight: 900,
    background: "linear-gradient(90deg,rgba(34,211,238,.14),rgba(236,72,153,.12))",
    border: "1px solid #ff2b6d",
    borderRadius: 6,
    margin: "0 8px",
  },
  logoutBtn: {
    color: "#ff2b6d",
    background: "transparent",
    border: 0,
    padding: "13px 22px",
    textAlign: "left",
    fontWeight: 900,
    fontSize: 15,
    cursor: "pointer",
  },
  main: {
    marginLeft: 250,
    width: "calc(100% - 250px)",
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top right,rgba(236,72,153,.13),transparent 25%), radial-gradient(circle at top left,rgba(34,211,238,.10),transparent 25%), #080a0f",
  },
  header: {
    height: 76,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    background: "rgba(10,12,18,.9)",
    borderBottom: "1px solid rgba(255,255,255,.08)",
  },
  menuBtn: {
    background: "transparent",
    color: "#9ca3af",
    border: 0,
    fontSize: 26,
    cursor: "pointer",
  },
  balanceTop: {
    border: "1px solid #22d3ee",
    color: "#22d3ee",
    padding: "8px 14px",
    borderRadius: 6,
    fontWeight: 900,
  },
  userArea: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,.1)",
    background: "#111827",
    color: "#22d3ee",
    cursor: "pointer",
  },
  bell: {
    position: "relative",
    fontSize: 22,
  },
  badge: {
    position: "absolute",
    top: -10,
    right: -10,
    background: "#ff2b6d",
    color: "white",
    borderRadius: "50%",
    width: 20,
    height: 20,
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "#111827",
    color: "#22d3ee",
    border: "1px solid #22d3ee",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
  },
  content: {
    padding: 28,
  },
  notice: {
    display: "flex",
    alignItems: "center",
    gap: 26,
    border: "1px solid rgba(255,255,255,.13)",
    borderLeft: "1px solid #22d3ee",
    borderRight: "2px solid #ff2b6d",
    borderRadius: 8,
    padding: 26,
    marginBottom: 20,
    background: "linear-gradient(135deg,rgba(255,255,255,.045),rgba(255,255,255,.015))",
  },
  noticeIcon: {
    width: 78,
    height: 78,
    borderRadius: "50%",
    border: "1px solid #22d3ee",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 42,
    boxShadow: "0 0 24px rgba(34,211,238,.18)",
  },
  backBtn: {
    display: "inline-block",
    color: "#d1d5db",
    textDecoration: "none",
    border: "1px solid #ff2b6d",
    borderLeftColor: "#22d3ee",
    padding: "9px 14px",
    borderRadius: 6,
    marginBottom: 18,
  },
  box: {
    border: "1px solid rgba(255,255,255,.11)",
    borderRadius: 10,
    padding: 20,
    background: "rgba(255,255,255,.025)",
    boxShadow: "0 20px 60px rgba(0,0,0,.25)",
  },
  title: {
    marginTop: 0,
    marginBottom: 22,
    fontSize: 24,
    color: "white",
  },
  toolRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    color: "#d1d5db",
  },
  select: {
    background: "#0f1117",
    color: "#d1d5db",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 6,
    padding: "8px 12px",
  },
  search: {
    background: "#0f1117",
    color: "white",
    border: "1px solid #ff2b6d",
    borderLeftColor: "#22d3ee",
    borderRadius: 6,
    padding: "10px 14px",
    outline: "none",
  },
  table: {
    width: "100%",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 6,
    overflow: "hidden",
  },
  head: {
    display: "grid",
    gridTemplateColumns: "70px 1.4fr 1.2fr 110px 130px 1.3fr 240px",
    background: "rgba(255,255,255,.035)",
    color: "#d1d5db",
    fontWeight: 900,
    padding: "16px 14px",
    borderBottom: "1px solid rgba(255,255,255,.08)",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "70px 1.4fr 1.2fr 110px 130px 1.3fr 240px",
    alignItems: "center",
    padding: "16px 14px",
    borderBottom: "1px solid rgba(255,255,255,.06)",
    color: "#d1d5db",
  },
  code: {
    color: "#22d3ee",
    fontWeight: 900,
  },
  product: {
    color: "#22d3ee",
    fontWeight: 900,
  },
  qty: {
    color: "#22d3ee",
    fontWeight: 900,
  },
  money: {
    color: "#ff2b6d",
    fontWeight: 900,
  },
  actions: {
    display: "flex",
    gap: 8,
  },
  viewBtn: {
    color: "#22d3ee",
    border: "1px solid #22d3ee",
    padding: "9px 14px",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: 800,
  },
  downloadBtn: {
    color: "#ff2b6d",
    border: "1px solid #ff2b6d",
    padding: "9px 14px",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: 800,
  },
  empty: {
    padding: 26,
    textAlign: "center",
    color: "#d1d5db",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    color: "#d1d5db",
  },
  pagination: {
    display: "flex",
    gap: 8,
  },
  pageBtn: {
    background: "#0f1117",
    color: "#6b7280",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 6,
    padding: "9px 14px",
  },
  pageActive: {
    background: "#111827",
    color: "#ff2b6d",
    border: "1px solid #ff2b6d",
    borderLeftColor: "#22d3ee",
    borderRadius: 6,
    padding: "9px 14px",
  },
};