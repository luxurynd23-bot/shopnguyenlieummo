"use client";

import { useEffect, useState } from "react";

const categories = ["TẤT CẢ", "TIKTOK VIỆT", "GMAIL", "HOTMAIL", "SHOPEE", "PROXY"];

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
    shopName: "ShopMMO",
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
        shopName: dataSettings.settings?.shopName || "ShopMMO",
        shopDomain: dataSettings.settings?.shopDomain || "shopnguyenlieummo.info.vn",
        warrantyText: dataSettings.settings?.warrantyText || "Bảo hành 6 giờ kể từ thời điểm giao tài khoản.",
        noticeText: dataSettings.settings?.noticeText || "Sau khi mua, hệ thống tự động trừ số dư và giao tài khoản.",
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
        body: JSON.stringify({ productId: buyProduct.id, quantity: buyQty }),
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
          <div style={styles.logoRow}>
            <img src="/tiktok-logo.png" style={styles.sideLogoImg} />
            <div>
              <div style={styles.logo}>{settings.shopName}</div>
              <div style={styles.domain}>{settings.shopDomain}</div>
            </div>
          </div>
        </div>

        <div style={styles.smallText}>Select Language: <b>Vietnamese</b></div>
        <div style={styles.smallText}>Select Currency: <b>VND⌄</b></div>

        <div style={styles.balanceLine}>
          SỐ DƯ <b>{(user?.balance || 0).toLocaleString("vi-VN")}đ</b> - GIẢM: <b style={{ color: "red" }}>0%</b>
        </div>

        <nav style={styles.nav}>
          <a href="/" style={styles.navItem}>🏠 Trang Chủ</a>
          <a href="/orders" style={styles.navItem}>🛒 Mua Tài Khoản</a>
          <a href="/orders" style={styles.navItem}>📋 Lịch Sử Mua Hàng</a>
          <a href="/deposit" style={styles.navItem}>🏦 Ngân Hàng</a>
          <a href="/deposit-history" style={styles.navItem}>📜 Hoá Đơn</a>
          <a href="/settings" style={styles.navItem}>⚙️ Cài Đặt</a>
          <button onClick={logout} style={styles.navButton}>🚪 Đăng xuất</button>

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
          <div style={styles.leftHeader}>
            <button style={styles.menuBtn}>☰</button>
            <input
              placeholder="Tìm sản phẩm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={styles.search}
            />
          </div>

          {user ? (
            <div style={styles.userArea}>
              <button style={styles.iconBtn}>☼</button>
              <button style={styles.iconBtn}>☾</button>
              <span style={styles.bell}>🔔</span>

              <div style={styles.userWrap}>
                <div style={styles.userHead} onClick={() => setShowUserMenu(!showUserMenu)}>
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
            <div style={{ display: "flex", gap: 10 }}>
              <a href="/login" style={styles.loginBtn}>Đăng nhập</a>
              <a href="/register" style={styles.registerBtn}>Đăng ký</a>
            </div>
          )}
        </header>

        <section style={styles.content}>
          <div style={styles.notice}>
            <b style={{ color: "#a21caf" }}>
              Bảo hành đăng nhập lần đầu trong 1 ngày kể từ lúc mua hàng.
            </b>
            <br />
            <b>Nên mua số lượng đủ làm trong ngày và nên mua ít kiểm tra trước.</b>
            <p><b>{settings.warrantyText}</b></p>
            <p>{settings.noticeText}</p>
            <p style={{ color: "#2563eb" }}>
              Link tải tool đọc OTP toàn bộ các email hotmail, Mail Domain có trên web.
              <br />
              Tính năng copy và input toàn bộ thông tin username|pass|email.
              <br />
              Tự động nhận dạng email input cần lựa chọn email đọc.
            </p>
            <p>• Nhóm thông báo <b>SUPPORT HỖ TRỢ</b> <span style={{ color: "#2563eb" }}>ZALO</span></p>
            <b style={{ color: "#b91c1c" }}>
              ⚠ Lưu ý: Mọi hành vi sử dụng vào các mục đích vi phạm pháp luật đều bị cấm.
            </b>
          </div>

          <div style={styles.blueBar}>Chuyên link đọc OTP loại ac Mail Domain</div>

          <div style={styles.categoryGrid}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                style={{
                  ...styles.catBtn,
                  background: activeCat === cat ? "#e5e7eb" : "#202020",
                  color: activeCat === cat ? "#2563eb" : "white",
                }}
              >
                {cat === "TẤT CẢ" ? "🛒 TẤT CẢ SẢN PHẨM" : `🎵 ${cat}`}
              </button>
            ))}
          </div>

          <div style={styles.productTable}>
            <div style={styles.groupTitle}>
              <img src="/tiktok-logo.png" style={styles.groupIcon} />
              TT Việt
            </div>

            <div style={styles.tableHead}>
              <div>Sản phẩm</div>
              <div>Hiện có</div>
              <div>Giá</div>
              <div>Thao tác</div>
            </div>

            {filteredProducts.map((p) => (
              <div key={p.id} style={styles.tableRow}>
                <div style={styles.productInfo}>
                  <img src="/tiktok-logo.png" style={styles.productLogo} />
                  <div>
                    <div style={styles.productName}>{p.name}</div>
                    <div style={styles.desc}>
                      Bảo hành 6 tiếng tính từ lúc mua. Hàng tự động giao ngay.
                    </div>
                  </div>
                </div>

                <div style={styles.stockBox}>Còn lại: <b>{p.stock}</b></div>
                <div style={styles.priceBox}>💵 {p.price.toLocaleString("vi-VN")}đ</div>

                <button
                  onClick={() => openBuyPopup(p)}
                  disabled={p.stock <= 0}
                  style={{
                    ...styles.buyBtn,
                    background: p.stock > 0 ? "#2563eb" : "#94a3b8",
                  }}
                >
                  {p.stock > 0 ? "🛒 MUA NGAY" : "☹ HẾT HÀNG"}
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
              <button style={styles.closeModal} onClick={() => setBuyProduct(null)}>×</button>

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

              <button style={styles.discountBtn}>Nhập mã giảm giá</button>

              <div style={styles.totalText}>
                Tổng tiền cần thanh toán:{" "}
                <b style={{ color: "red" }}>
                  {(buyProduct.price * buyQty).toLocaleString("vi-VN")}đ
                </b>
              </div>

              <button style={styles.payButton} onClick={confirmBuy} disabled={loadingBuy}>
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
  page: { minHeight: "100vh", background: "#eef3fb", fontFamily: "Arial, sans-serif", display: "flex" },
  sidebar: { width: 260, minHeight: "100vh", background: "linear-gradient(180deg,#1e3a8a,#273247)", color: "white", padding: 16, position: "fixed", left: 0, top: 0 },
  logoBox: { background: "white", color: "#1e3a8a", borderRadius: 6, padding: 14, marginBottom: 16 },
  logoRow: { display: "flex", alignItems: "center", gap: 10 },
  sideLogoImg: { width: 55, height: 55, objectFit: "contain" },
  logo: { fontSize: 28, fontWeight: 900, lineHeight: 1 },
  domain: { fontSize: 13, marginTop: 4, fontWeight: 700 },
  smallText: { fontSize: 14, margin: "14px 0", fontWeight: 700 },
  balanceLine: { fontSize: 14, margin: "22px 0", color: "#cbd5e1" },
  nav: { display: "grid", gap: 8 },
  navItem: { color: "white", textDecoration: "none", padding: "10px 12px", borderRadius: 8, fontWeight: 800 },
  navButton: { color: "white", padding: "10px 12px", borderRadius: 8, background: "transparent", fontWeight: 800, border: 0, textAlign: "left", cursor: "pointer", fontSize: 15 },
  main: { marginLeft: 260, width: "calc(100% - 260px)" },
  header: { height: 72, background: "white", boxShadow: "0 2px 10px rgba(0,0,0,.08)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", position: "sticky", top: 0, zIndex: 10 },
  leftHeader: { display: "flex", alignItems: "center", gap: 18 },
  menuBtn: { border: 0, background: "white", fontSize: 26, color: "#64748b", cursor: "pointer" },
  search: { width: 360, padding: "12px 14px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 15 },
  userArea: { display: "flex", alignItems: "center", gap: 12, position: "relative" },
  iconBtn: { width: 36, height: 36, borderRadius: 5, border: "1px solid #1e3a8a", background: "#1e3a8a", color: "white", fontWeight: 900, cursor: "pointer" },
  bell: { fontSize: 20, opacity: 0.7 },
  userWrap: { position: "relative" },
  userHead: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  avatar: { width: 44, height: 44, borderRadius: "50%", background: "#2563eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 },
  userName: { fontWeight: 700, color: "#334155" },
  dropdown: { position: "absolute", top: 56, right: 0, width: 220, background: "white", borderRadius: 8, boxShadow: "0 12px 30px rgba(0,0,0,.18)", padding: "10px 0", zIndex: 99 },
  dropItem: { display: "block", padding: "12px 18px", color: "#334155", textDecoration: "none", fontSize: 14 },
  dropBtn: { display: "block", width: "100%", padding: "12px 18px", color: "#334155", background: "white", border: 0, textAlign: "left", fontSize: 14, cursor: "pointer" },
  loginBtn: { background: "#2563eb", color: "white", padding: "10px 16px", borderRadius: 8, textDecoration: "none", fontWeight: 800 },
  registerBtn: { background: "#16a34a", color: "white", padding: "10px 16px", borderRadius: 8, textDecoration: "none", fontWeight: 800 },
  content: { padding: 18 },
  notice: { background: "white", border: "2px solid #2563eb", borderRadius: 4, padding: 24, marginBottom: 16, lineHeight: 1.45 },
  blueBar: { background: "#2563eb", color: "white", textAlign: "right", padding: "10px 18px", borderRadius: 4, marginBottom: 28, fontWeight: 700 },
  categoryGrid: { display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 22 },
  catBtn: { border: 0, borderRadius: 6, padding: 18, fontWeight: 900, cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,.15)" },
  productTable: { width: "100%", background: "white", borderRadius: 4, overflow: "hidden", border: "1px solid #cbd5e1" },
  groupTitle: { background: "#1e3a8a", color: "white", padding: "14px 18px", fontWeight: 900, display: "flex", alignItems: "center", gap: 10 },
  groupIcon: { width: 38, height: 38, objectFit: "cover", borderRadius: 4 },
  tableHead: { display: "grid", gridTemplateColumns: "1fr 160px 170px 190px", background: "#1e3a8a", color: "white", fontWeight: 900, padding: "16px 20px", alignItems: "center" },
  tableRow: { display: "grid", gridTemplateColumns: "1fr 160px 170px 190px", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid #dbeafe", background: "#f8fbff" },
  productInfo: { display: "flex", alignItems: "center", gap: 14 },
  productLogo: { width: 48, height: 48, borderRadius: 8, objectFit: "cover" },
  productName: { fontWeight: 900, color: "#1d4ed8", fontSize: 15 },
  desc: { color: "#111827", fontSize: 13, lineHeight: 1.5, marginTop: 4 },
  stockBox: { justifySelf: "center", border: "1px solid #06b6d4", color: "#0f766e", borderRadius: 6, padding: "7px 12px", background: "white" },
  priceBox: { justifySelf: "center", border: "1px solid #ef4444", color: "#111827", borderRadius: 6, padding: "7px 12px", background: "white", fontWeight: 900 },
  buyBtn: { width: "150px", padding: "10px", color: "white", border: 0, borderRadius: 6, fontWeight: 900, cursor: "pointer", justifySelf: "center" },
  empty: { background: "white", padding: 20, borderRadius: 12 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 },
  buyModal: { width: 520, background: "white", borderRadius: 8, padding: 24, position: "relative", boxShadow: "0 15px 35px rgba(0,0,0,.25)" },
  closeModal: { position: "absolute", top: 10, right: 10, width: 30, height: 30, border: 0, borderRadius: 6, background: "#ef4444", color: "white", cursor: "pointer", fontSize: 18, fontWeight: 900 },
  modalTitle: { fontSize: 24, fontWeight: 900, marginBottom: 24, color: "#334155" },
  label: { display: "block", marginBottom: 8, fontWeight: 700, color: "#334155" },
  productInput: { background: "#e5e7eb", padding: 14, borderRadius: 6, marginBottom: 18, color: "#334155" },
  qtyInput: { width: "100%", padding: 14, border: "1px solid #e5e7eb", borderRadius: 6, marginBottom: 18, fontSize: 16 },
  discountBtn: { float: "right", background: "#ef4444", color: "white", border: 0, borderRadius: 6, padding: "12px 18px", fontWeight: 900, cursor: "pointer", marginBottom: 20 },
  totalText: { clear: "both", textAlign: "center", fontSize: 22, margin: "28px 0", color: "#334155" },
  payButton: { width: "100%", background: "#2563eb", color: "white", border: 0, borderRadius: 6, padding: 15, fontSize: 17, fontWeight: 900, cursor: "pointer" },
};