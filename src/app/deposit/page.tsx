"use client";

import { useEffect, useState } from "react";

const packages = [
  { amount: 100000, bonus: 0, icon: "💳" },
  { amount: 500000, bonus: 2, icon: "🏦" },
  { amount: 1000000, bonus: 5, icon: "💎" },
];

export default function DepositPage() {
  const [user, setUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadUser() {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function createPayment(value?: number) {
    const money = Number(value || amount);

    if (!money || money < 10000) {
      alert("Số tiền nạp tối thiểu là 10.000đ");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: money }),
      });

      const data = await res.json();

      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.message || "Không tạo được thanh toán");
      }
    } catch {
      alert("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logoBox}>
          <img src="/tiktok-logo.png" style={styles.logoImg} />
          <div>
            <div style={styles.logoText}>ShopMMO</div>
            <div style={styles.logoDomain}>shopnguyenlieummo.vn</div>
          </div>
        </div>

        <div style={styles.sideInfo}>Ngôn ngữ: <b>Vietnamese⌄</b></div>
        <div style={styles.sideInfo}>Tiền tệ: <b>VND⌄</b></div>

        <div style={styles.balance}>
          Số dư:{" "}
          <b style={{ color: "#22d3ee" }}>
            {(user?.balance || 0).toLocaleString("vi-VN")}đ
          </b>{" "}
          - Giảm: <b style={{ color: "#ff2b6d" }}>0%</b>
        </div>

        <nav style={styles.nav}>
          <a href="/" style={styles.navItem}>🏠 Trang Chủ</a>
          <a href="/" style={styles.navItem}>🛒 Mua Tài Khoản</a>
          <a href="/orders" style={styles.navItem}>↺ Lịch Sử Mua Hàng</a>
          <a href="/rank" style={styles.navItem}>🏆 Bảng Xếp Hạng</a>
          <a href="/deposit" style={styles.navActive}>🏦 Ngân Hàng</a>
          <a href="/deposit-history" style={styles.navItem}>🧾 Hoá Đơn</a>
        </nav>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <button style={styles.menuBtn}>☰</button>

          <div style={styles.wallet}>
            💳 Ví: {(user?.balance || 0).toLocaleString("vi-VN")}đ
          </div>

          <div style={styles.userBox}>
            🌙 🔔 🧔 {user?.name || user?.email || "Khách"}⌄
          </div>
        </header>

        <section style={styles.content}>
          <a href="/" style={styles.backBtn}>← Quay lại trang chủ</a>

          <div style={styles.notice}>
            <div style={styles.noticeIcon}>📢</div>
            <ul style={styles.noticeList}>
              <li>Quét mã QR để tự động nhập nội dung. Nhập thủ công vui lòng nhập đúng nội dung CK để được cộng tự động.</li>
              <li>Nạp tối thiểu <b style={styles.cyan}>10.000đ</b>, nạp dưới sẽ không được cộng.</li>
              <li>Số dư tự động cộng sau 1-10 phút. Nếu chưa cộng, liên hệ admin.</li>
              <li>Không hoàn tiền số dư đã nạp.</li>
            </ul>
          </div>

          <div style={styles.bonusTable}>
            <div style={styles.bonusHead}>
              <div>#</div>
              <div>Số tiền nạp lớn hơn hoặc bằng</div>
              <div>Khuyến mãi thêm</div>
            </div>

            <div style={styles.bonusRow}>
              <div>1</div>
              <div style={styles.cyan}>1.000.000đ</div>
              <div style={styles.pink}>5%</div>
            </div>

            <div style={styles.bonusRow}>
              <div>2</div>
              <div style={styles.cyan}>500.000đ</div>
              <div style={styles.pink}>2%</div>
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.title}>💳 Nạp tiền theo hoá đơn</h2>

            <div style={styles.packageGrid}>
              {packages.map((p) => (
                <div key={p.amount} style={styles.packageCard}>
                  <div style={styles.packageIcon}>{p.icon}</div>
                  <div style={styles.amount}>
                    {p.amount.toLocaleString("vi-VN")}đ
                  </div>
                  <div style={styles.bonusText}>
                    Khuyến mãi: <b style={styles.pink}>{p.bonus}%</b>
                  </div>
                  <button
                    style={styles.packageBtn}
                    disabled={loading}
                    onClick={() => createPayment(p.amount)}
                  >
                    Chọn gói
                  </button>
                </div>
              ))}

              <div style={styles.packageCard}>
                <div style={styles.packageIcon}>🧾</div>
                <div style={styles.customTitle}>Nhập số tiền</div>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ví dụ: 200000"
                  style={styles.input}
                />
                <div style={styles.bonusText}>
                  Khuyến mãi: <b style={styles.pink}>0%</b>
                </div>
                <button
                  style={styles.packageBtn}
                  disabled={loading}
                  onClick={() => createPayment()}
                >
                  Chọn số tiền
                </button>
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
    display: "flex",
    fontFamily: "Arial, sans-serif",
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
    height: 82,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 18px",
    borderBottom: "1px solid rgba(255,255,255,.08)",
  },
  logoImg: {
    width: 56,
    height: 56,
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
    borderLeftColor: "#22d3ee",
    borderRadius: 6,
    margin: "0 8px",
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
  wallet: {
    border: "1px solid #22d3ee",
    color: "#22d3ee",
    padding: "9px 16px",
    borderRadius: 8,
    fontWeight: 900,
  },
  userBox: {
    color: "#e5e7eb",
    fontWeight: 800,
  },
  content: {
    padding: 28,
  },
  backBtn: {
    display: "inline-block",
    color: "#e5e7eb",
    textDecoration: "none",
    border: "1px solid #ff2b6d",
    borderLeftColor: "#22d3ee",
    padding: "10px 15px",
    borderRadius: 8,
    marginBottom: 18,
    fontWeight: 800,
  },
  notice: {
    display: "flex",
    gap: 28,
    alignItems: "center",
    padding: 26,
    borderRadius: 12,
    background: "linear-gradient(135deg,rgba(255,255,255,.045),rgba(255,255,255,.015))",
    border: "1px solid rgba(255,255,255,.12)",
    borderLeft: "1px solid #22d3ee",
    borderRight: "2px solid #ff2b6d",
    marginBottom: 22,
  },
  noticeIcon: {
    width: 82,
    height: 82,
    borderRadius: "50%",
    border: "1px solid #22d3ee",
    color: "#ff2b6d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 42,
    boxShadow: "0 0 24px rgba(34,211,238,.18)",
  },
  noticeList: {
    lineHeight: 1.9,
    margin: 0,
  },
  cyan: {
    color: "#22d3ee",
    fontWeight: 900,
  },
  pink: {
    color: "#ff2b6d",
    fontWeight: 900,
  },
  bonusTable: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
    border: "1px solid rgba(255,255,255,.10)",
  },
  bonusHead: {
    display: "grid",
    gridTemplateColumns: "100px 1fr 360px",
    background: "linear-gradient(90deg,#09b6c8,#ff0f5f)",
    color: "white",
    fontWeight: 900,
  },
  bonusRow: {
    display: "grid",
    gridTemplateColumns: "100px 1fr 360px",
    borderTop: "1px solid rgba(255,255,255,.08)",
    background: "rgba(255,255,255,.02)",
  },
  card: {
    borderRadius: 14,
    padding: 18,
    background: "rgba(255,255,255,.025)",
    border: "1px solid rgba(255,255,255,.10)",
  },
  title: {
    margin: "6px 0 22px",
    fontSize: 24,
    color: "white",
  },
  packageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 18,
  },
  packageCard: {
    minHeight: 240,
    borderRadius: 14,
    padding: 22,
    textAlign: "center",
    background: "linear-gradient(135deg,rgba(255,255,255,.045),rgba(255,255,255,.015))",
    border: "1px solid rgba(255,255,255,.10)",
  },
  packageIcon: {
    width: 86,
    height: 86,
    margin: "0 auto 18px",
    borderRadius: "50%",
    border: "1px solid #22d3ee",
    color: "#ff2b6d",
    fontSize: 46,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 24px rgba(34,211,238,.18)",
  },
  amount: {
    color: "#22d3ee",
    fontSize: 24,
    fontWeight: 900,
    marginBottom: 18,
  },
  customTitle: {
    color: "#22d3ee",
    fontSize: 24,
    fontWeight: 900,
    marginBottom: 16,
  },
  bonusText: {
    marginBottom: 22,
    color: "#cbd5e1",
  },
  input: {
    width: "100%",
    padding: "13px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,.12)",
    background: "#0f1117",
    color: "white",
    marginBottom: 14,
    textAlign: "center",
    outline: "none",
  },
  packageBtn: {
    background: "linear-gradient(90deg,#09b6c8,#ff0f5f)",
    color: "white",
    border: 0,
    borderRadius: 8,
    padding: "13px 32px",
    fontWeight: 900,
    cursor: "pointer",
  },
};