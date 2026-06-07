"use client";

import { useEffect, useState } from "react";

const categories = [
  "TẤT CẢ",
  "TIKTOK VIỆT",
  "GMAIL",
  "HOTMAIL",
  "SHOPEE",
  "PROXY",
];

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");
  const [activeCat, setActiveCat] = useState("TẤT CẢ");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [buyProduct, setBuyProduct] = useState<any>(null);
  const [buyQty, setBuyQty] = useState(1);
  const [loadingBuy, setLoadingBuy] = useState(false);

  const [settings, setSettings] = useState<any>({
    shopName: "NL MMO",
    shopDomain: "shopnguyenlieummo.info.vn",
    warrantyText: "Bảo hành 6 giờ kể từ thời điểm giao tài khoản.",
    noticeText: "Sau khi mua, hệ thống tự động trừ số dư và giao tài khoản.",
  });

  async function loadData() {
    try {
      const resUser = await fetch("/api/me");
      const dataUser = await resUser.json();
      setUser(dataUser.user || null);

      const resProducts = await fetch("/api/products");
      const dataProducts = await resProducts.json();
      setProducts(dataProducts.products || []);

      const resSettings = await fetch("/api/admin-settings");
      const dataSettings = await resSettings.json();

      setSettings({
        shopName: dataSettings.settings?.shopName || "NL MMO",
        shopDomain:
          dataSettings.settings?.shopDomain ||
          "shopnguyenlieummo.info.vn",
        warrantyText:
          dataSettings.settings?.warrantyText ||
          "Bảo hành 6 giờ kể từ thời điểm giao tài khoản.",
        noticeText:
          dataSettings.settings?.noticeText ||
          "Sau khi mua, hệ thống tự động trừ số dư và giao tài khoản.",
      });
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openBuyPopup(product: any) {
    if (!user) {
      alert("Bạn cần đăng nhập trước khi mua hàng");
      window.location.href = "/login";
      return;
    }

    setBuyProduct(product);
    setBuyQty(1);
  }

  async function confirmBuy() {
    if (!buyProduct) return;

    if (!buyQty || buyQty < 1) {
      alert("Vui lòng nhập số lượng cần mua");
      return;
    }

    if (buyQty > buyProduct.stock) {
      alert("Số lượng mua vượt quá kho hiện có");
      return;
    }

    setLoadingBuy(true);

    try {
      const res = await fetch("/api/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: buyProduct.id,
          quantity: buyQty,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Mua thành công!");
        setBuyProduct(null);
        setBuyQty(1);
        loadData();

        if (data.orderId) {
          window.location.href = `/orders/${data.orderId}`;
        }
      } else {
        alert(data.message || "Mua thất bại");
      }
    } catch {
      alert("Lỗi kết nối");
    } finally {
      setLoadingBuy(false);
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const filteredProducts = products.filter((p) => {
    const matchKeyword = p.name.toLowerCase().includes(keyword.toLowerCase());
    const matchCat =
      activeCat === "TẤT CẢ" ||
      p.name.toUpperCase().includes(activeCat.replace(" VIỆT", ""));
    return matchKeyword && matchCat;
  });

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logoBox}>
          <div style={styles.logo}>{settings.shopName}</div>
          <div style={styles.domain}>{settings.shopDomain}</div>
        </div>

        <div style={styles.balanceBox}>
          <div>SỐ DƯ</div>
          <b>{(user?.balance || 0).toLocaleString("vi-VN")}đ</b>
        </div>

        <nav style={styles.nav}>
          <a href="/" style={styles.navItem}>🏠 Trang chủ</a>
          <a href="/orders" style={styles.navItem}>🛒 Lịch sử mua</a>
          <a href="/wallet" style={styles.navItem}>💰 Ví của tôi</a>
          <a href="/deposit" style={styles.navItem}>🏦 Nạp tiền</a>
          <a href="/deposit-history" style={styles.navItem}>📜 Lịch sử nạp</a>
          <a href="/settings" style={styles.navItem}>⚙️ Cài đặt</a>

          <button onClick={logout} style={styles.navButton}>
            🚪 Đăng xuất
          </button>

          {user?.role === "ADMIN" && (
            <>
              <a href="/admin/dashboard" style={styles.navItem}>📊 Dashboard</a>
              <a href="/admin" style={styles.navItem}>📦 Sản phẩm</a>
              <a href="/admin/orders" style={styles.navItem}>📋 Đơn hàng</a>
              <a href="/admin/users" style={styles.navItem}>👤 Users</a>
            </>
          )}
        </nav>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <input
            placeholder="Tìm sản phẩm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={styles.search}
          />

          {user ? (
            <div style={styles.userArea}>
              <button style={styles.iconBtn}>☼</button>
              <button style={styles.iconBtn}>☾</button>
              <span style={styles.bell}>🔔</span>

              <div style={styles.userWrap}>
                <div
                  style={styles.userHead}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div style={styles.avatar}>
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <span style={styles.userName}>{user.name || user.email}</span>
                </div>

                {showUserMenu && (
                  <div style={styles.dropdown}>
                    <a href="/settings" style={styles.dropItem}>◎ Trang cá nhân</a>
                    <a href="/settings" style={styles.dropItem}>✎ Thay đổi mật khẩu</a>
                    <a href="/deposit-history" style={styles.dropItem}>♙ Nhật ký hoạt động</a>
                    <a href="/wallet" style={styles.dropItem}>⊕ Biến động số dư</a>
                    <a href="/settings" style={styles.dropItem}>♡ Bảo mật</a>
                    <button onClick={logout} style={styles.dropBtn}>↪ Đăng xuất</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <a href="/login" style={styles.loginBtn}>
              Đăng nhập
            </a>
          )}
        </header>

        <section style={styles.content}>
          <div style={styles.notice}>
            <h2>Thông báo</h2>
            <p>{settings.warrantyText}</p>
            <p>{settings.noticeText}</p>
            <b style={{ color: "#dc2626" }}>
              Vui lòng kiểm tra tài khoản ngay sau khi mua.
            </b>
            <p>
              Vào nhóm để cập nhật thông báo và bảo hành zalo:
              https://zalo.me/g/qrwsmhppu8dnxawtu3xu
            </p>
            <p>ADMIN hỗ trợ: http://zalo.me/84337116737</p>
          </div>

          <div style={styles.categoryGrid}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                style={{
                  ...styles.catBtn,
                  background: activeCat === cat ? "#2563eb" : "#111827",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={styles.productGrid}>
            {filteredProducts.map((p) => (
              <div key={p.id} style={styles.card}>
                <div style={styles.productName}>{p.name}</div>

                <p style={styles.desc}>
                  Bảo hành 6 tiếng tính từ lúc mua. Hàng tự động giao ngay.
                </p>

                <div style={styles.infoRow}>
                  <span>Kho:</span>
                  <b style={{ color: p.stock > 0 ? "#16a34a" : "#dc2626" }}>
                    {p.stock}
                  </b>
                </div>

                <div style={styles.price}>
                  {p.price.toLocaleString("vi-VN")}đ
                </div>

                <button
                  onClick={() => openBuyPopup(p)}
                  disabled={p.stock <= 0}
                  style={{
                    ...styles.buyBtn,
                    background: p.stock > 0 ? "#2563eb" : "#94a3b8",
                  }}
                >
                  {p.stock > 0 ? "MUA NGAY" : "HẾT HÀNG"}
                </button>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div style={styles.empty}>Không có sản phẩm phù hợp.</div>
          )}
        </section>

        {buyProduct && (
          <div style={styles.modalOverlay}>
            <div style={styles.buyModal}>
              <button
                style={styles.closeModal}
                onClick={() => setBuyProduct(null)}
              >
                ×
              </button>

              <h2 style={styles.modalTitle}>Thanh toán đơn hàng</h2>

              <label style={styles.label}>Tên sản phẩm:</label>
              <div style={styles.productInput}>{buyProduct.name}</div>

              <label style={styles.label}>Số lượng cần mua:</label>
              <input
                type="number"
                min={1}
                max={buyProduct.stock}
                value={buyQty}
                onChange={(e) => setBuyQty(Number(e.target.value))}
                placeholder="Nhập số lượng cần mua"
                style={styles.qtyInput}
              />

              <button style={styles.discountBtn}>
                Nhập mã giảm giá
              </button>

              <div style={styles.totalText}>
                Tổng tiền cần thanh toán:{" "}
                <b style={{ color: "red" }}>
                  {(buyProduct.price * buyQty).toLocaleString("vi-VN")}đ
                </b>
              </div>

              <button
                style={styles.payButton}
                onClick={confirmBuy}
                disabled={loadingBuy}
              >
                💳 {loadingBuy ? "Đang xử lý..." : "Thanh toán"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#f3f6fb",
    fontFamily: "Arial, sans-serif",
    display: "flex",
  },
  sidebar: {
    width: 270,
    minHeight: "100vh",
    background: "linear-gradient(180deg,#1e3a8a,#172554)",
    color: "white",
    padding: 18,
    position: "fixed",
    left: 0,
    top: 0,
  },
  logoBox: {
    background: "white",
    color: "#1e3a8a",
    borderRadius: 14,
    padding: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  logo: {
    fontSize: 30,
    fontWeight: 900,
  },
  domain: {
    fontSize: 13,
    marginTop: 4,
  },
  balanceBox: {
    background: "rgba(255,255,255,.12)",
    border: "1px solid rgba(255,255,255,.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  nav: {
    display: "grid",
    gap: 8,
  },
  navItem: {
    color: "white",
    textDecoration: "none",
    padding: "12px 14px",
    borderRadius: 10,
    background: "rgba(255,255,255,.08)",
    fontWeight: 700,
  },
  navButton: {
    color: "white",
    textDecoration: "none",
    padding: "12px 14px",
    borderRadius: 10,
    background: "rgba(255,255,255,.08)",
    fontWeight: 700,
    border: 0,
    textAlign: "left",
    cursor: "pointer",
    fontSize: 16,
  },
  main: {
    marginLeft: 270,
    width: "calc(100% - 270px)",
  },
  header: {
    height: 76,
    background: "white",
    boxShadow: "0 2px 12px rgba(0,0,0,.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  search: {
    width: 360,
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 15,
  },
  userArea: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    position: "relative",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 6,
    border: "1px solid #1e3a8a",
    background: "#1e3a8a",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },
  bell: {
    fontSize: 20,
    opacity: 0.7,
  },
  userWrap: {
    position: "relative",
  },
  userHead: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "#2563eb",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
  },
  userName: {
    fontWeight: 700,
    color: "#334155",
  },
  dropdown: {
    position: "absolute",
    top: 56,
    right: 0,
    width: 220,
    background: "white",
    borderRadius: 8,
    boxShadow: "0 12px 30px rgba(0,0,0,.18)",
    padding: "10px 0",
    zIndex: 99,
  },
  dropItem: {
    display: "block",
    padding: "12px 18px",
    color: "#334155",
    textDecoration: "none",
    fontSize: 14,
  },
  dropBtn: {
    display: "block",
    width: "100%",
    padding: "12px 18px",
    color: "#334155",
    background: "white",
    border: 0,
    textAlign: "left",
    fontSize: 14,
    cursor: "pointer",
  },
  loginBtn: {
    background: "#2563eb",
    color: "white",
    padding: "10px 16px",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 800,
  },
  content: {
    padding: 24,
  },
  notice: {
    background: "white",
    border: "2px solid #2563eb",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    boxShadow: "0 6px 18px rgba(0,0,0,.06)",
  },
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6,1fr)",
    gap: 10,
    marginBottom: 22,
  },
  catBtn: {
    color: "white",
    border: 0,
    borderRadius: 10,
    padding: 16,
    fontWeight: 900,
    cursor: "pointer",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
    gap: 18,
  },
  card: {
    background: "white",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 6px 18px rgba(0,0,0,.08)",
    border: "1px solid #e5e7eb",
  },
  productName: {
    fontWeight: 900,
    color: "#1d4ed8",
    fontSize: 18,
    minHeight: 44,
  },
  desc: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 1.5,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
    borderTop: "1px solid #e5e7eb",
  },
  price: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: 900,
    color: "#dc2626",
  },
  buyBtn: {
    width: "100%",
    marginTop: 16,
    padding: "12px",
    color: "white",
    border: 0,
    borderRadius: 10,
    fontWeight: 900,
    cursor: "pointer",
  },
  empty: {
    background: "white",
    padding: 20,
    borderRadius: 12,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  buyModal: {
    width: 520,
    background: "white",
    borderRadius: 8,
    padding: 24,
    position: "relative",
    boxShadow: "0 15px 35px rgba(0,0,0,.25)",
  },
  closeModal: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    border: 0,
    borderRadius: 6,
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 900,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 900,
    marginBottom: 24,
    color: "#334155",
  },
  label: {
    display: "block",
    marginBottom: 8,
    fontWeight: 700,
    color: "#334155",
  },
  productInput: {
    background: "#e5e7eb",
    padding: 14,
    borderRadius: 6,
    marginBottom: 18,
    color: "#334155",
  },
  qtyInput: {
    width: "100%",
    padding: 14,
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    marginBottom: 18,
    fontSize: 16,
  },
  discountBtn: {
    float: "right",
    background: "#ef4444",
    color: "white",
    border: 0,
    borderRadius: 6,
    padding: "12px 18px",
    fontWeight: 900,
    cursor: "pointer",
    marginBottom: 20,
  },
  totalText: {
    clear: "both",
    textAlign: "center",
    fontSize: 22,
    margin: "28px 0",
    color: "#334155",
  },
  payButton: {
    width: "100%",
    background: "#2563eb",
    color: "white",
    border: 0,
    borderRadius: 6,
    padding: 15,
    fontSize: 17,
    fontWeight: 900,
    cursor: "pointer",
  },
};