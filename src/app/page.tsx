"use client";

import { useEffect, useState } from "react";

const categories = [
  { name: "TẤT CẢ", icon: "🛒" },
  { name: "TIKTOK VIỆT", icon: "🎵" },
  { name: "GMAIL", icon: "📧" },
  { name: "HOTMAIL", icon: "📨" },
  { name: "SHOPEE", icon: "🛍️" },
  { name: "PROXY", icon: "🌐" },
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

const [couponCode, setCouponCode] = useState("");
const [coupon, setCoupon] = useState<any>(null);

  const [settings, setSettings] = useState<any>({
    shopName: "SHOP MMO",
    shopDomain: "shopnguyenlieummo",
    warrantyText: "Bảo hành 6 giờ kể từ thời điểm giao tài khoản.",
    noticeText: "Sau khi mua, hệ thống tự động trừ số dư và giao tài khoản.",
  });

  const [activity, setActivity] = useState<any>({
    orders: [],
    deposits: [],
  });
const [stats, setStats] = useState({
  totalUsers: 0,
  totalOrders: 0,
  stockLeft: 0,
  totalDeposit: 0,
});
const [topDeposits, setTopDeposits] = useState<any[]>([]);
const [topOrders, setTopOrders] = useState<any[]>([]);
async function loadData() {
  try {
    const resUser = await fetch("/api/me");

    if (resUser.ok) {
      const dataUser = await resUser.json();
      setUser(dataUser.user || null);
    } else {
      setUser(null);
    }
  } catch {
    setUser(null);
  }

  try {
    const resProducts = await fetch("/api/products");

    if (resProducts.ok) {
      const dataProducts = await resProducts.json();
      setProducts(dataProducts.products || []);
    } else {
      setProducts([]);
    }
  } catch {
    setProducts([]);
  }

  try {
    const resSettings = await fetch("/api/public-settings");

    if (resSettings.ok) {
      const dataSettings = await resSettings.json();

      setSettings({
        shopName: dataSettings.settings?.shopName || "SHOP MMO",
        shopDomain: dataSettings.settings?.shopDomain || "shopnguyenlieummo",
        warrantyText:
          dataSettings.settings?.warrantyText ||
          "Bảo hành 6 giờ kể từ thời điểm giao tài khoản.",
        noticeText:
          dataSettings.settings?.noticeText ||
          "Sau khi mua, hệ thống tự động trừ số dư và giao tài khoản.",
      });
    }
  } catch {
    // bỏ qua lỗi settings để trang chủ không bị chết
  }

  try {
    const resActivity = await fetch("/api/public-activity");

    if (resActivity.ok) {
      const dataActivity = await resActivity.json();

      setActivity({
        orders: dataActivity.orders || [],
        deposits: dataActivity.deposits || [],
      });
    }
  } catch {
    // bỏ qua lỗi activity để trang chủ không bị chết
  }

  try {
    const resStats = await fetch("/api/public-stats");

    if (resStats.ok) {
      const dataStats = await resStats.json();

      setStats({
        totalUsers: dataStats.totalUsers || 0,
        totalOrders: dataStats.totalOrders || 0,
        stockLeft: dataStats.stockLeft || 0,
        totalDeposit: dataStats.totalDeposit || 0,
      });
    }
  } catch {
    // bỏ qua lỗi stats để trang chủ không bị chết
  }

  try {
    const resTop = await fetch("/api/public-top");

    if (resTop.ok) {
      const dataTop = await resTop.json();
      setTopDeposits(dataTop.topDeposits || []);
    }
  } catch {
    // bỏ qua lỗi top nạp để trang chủ không bị chết
  }

  try {
    const resTopOrders = await fetch("/api/public-top-orders");

    if (resTopOrders.ok) {
      const dataTopOrders = await resTopOrders.json();
      setTopOrders(dataTopOrders.topOrders || []);
    }
  } catch {
    // bỏ qua lỗi top mua để trang chủ không bị chết
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
    setCouponCode("");
    setCoupon(null);
  }

  async function checkCoupon() {
    if (!couponCode.trim()) {
      alert("Nhập mã giảm giá trước");
      return;
    }

    try {
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setCoupon(data.coupon);
        alert("Áp dụng mã thành công");
      } else {
        setCoupon(null);
        alert(data.message || "Mã không hợp lệ");
      }
    } catch {
      setCoupon(null);
      alert("Lỗi kết nối khi kiểm tra mã");
    }
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
          couponCode: coupon?.code || "",
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
function getUserRank(totalDeposit: number) {
  if (totalDeposit >= 10000000) {
    return "💎 Kim Cương";
  }

  if (totalDeposit >= 2000000) {
    return "🥇 Vàng";
  }

  if (totalDeposit >= 500000) {
    return "🥈 Bạc";
  }

  return "🥉 Đồng";
}

function getNextRankInfo(totalDeposit: number) {
  if (totalDeposit < 500000) {
    return { nextRank: "🥈 Bạc", need: 500000 - totalDeposit };
  }

  if (totalDeposit < 2000000) {
    return { nextRank: "🥇 Vàng", need: 2000000 - totalDeposit };
  }

  if (totalDeposit < 10000000) {
    return { nextRank: "💎 Kim Cương", need: 10000000 - totalDeposit };
  }

  return { nextRank: "MAX", need: 0 };
}
  const filteredProducts = products.filter((p) => {
    const matchKeyword = p.name.toLowerCase().includes(keyword.toLowerCase());
    const matchCat =
      activeCat === "TẤT CẢ" ||
      p.name.toUpperCase().includes(activeCat.replace(" VIỆT", ""));
    return matchKeyword && matchCat;
  });

  const totalPrice = buyProduct ? buyProduct.price * buyQty : 0;
  const discountAmount = coupon
    ? coupon.type === "PERCENT"
      ? Math.floor((totalPrice * Number(coupon.value || 0)) / 100)
      : Number(coupon.value || 0)
    : 0;
  const finalPrice = Math.max(totalPrice - discountAmount, 0);

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logoBox}>
          <img src="/tiktok-logo.png" style={styles.logoImg} />
          <div>
            <div style={styles.logoText}>{settings.shopName}</div>
            <div style={styles.logoDomain}>{settings.shopDomain}</div>
          </div>
          <span style={styles.onlineDot}></span>
        </div>

        <div style={styles.sideInfo}>🇻🇳 Ngôn ngữ: <b>Tiếng Việt⌄</b></div>
        <div style={styles.sideInfo}>💵 Tiền tệ: <b>VND⌄</b></div>

        <div style={styles.balance}>
          Số dư: <b>{(user?.balance || 0).toLocaleString("vi-VN")}đ</b> - Giảm:{" "}
          <b style={{ color: "#ff2b6d" }}>0%</b>
        </div>
{user?.role === "ADMIN" && (
  <div style={styles.adminPanel}>
    <div style={styles.adminTitle}>⚡ QUẢN TRỊ NHANH</div>

    <a href="/admin/dashboard" style={styles.adminBtn}>
      📊 Dashboard
    </a>

    <a href="/admin" style={styles.adminBtn}>
      📦 Sản phẩm
    </a>

    <a href="/admin/stock" style={styles.adminBtn}>
      📥 Nhập kho
    </a>

    <a href="/admin/orders" style={styles.adminBtn}>
      📋 Đơn hàng
    </a>

    <a href="/admin/users" style={styles.adminBtn}>
      👤 Users
    </a>

    <a href="/admin/tickets" style={styles.adminBtn}>
      🎫 Tickets
    </a>

    <a href="/admin/settings" style={styles.adminBtn}>
      ⚙️ Cài đặt
    </a>
  </div>
)}
        <nav style={styles.nav}>
          <a href="/" style={styles.navActive}>🏠 Trang Chủ</a>
          <a href="/" style={styles.navItem}>🛒 Mua Tài Khoản</a>
          <a href="/orders" style={styles.navItem}>📋 Lịch Sử Mua Hàng</a>
          <a href="/deposit" style={styles.navItem}>🏦 Ngân Hàng</a>
          <a href="/deposit-history" style={styles.navItem}>🧾 Hoá Đơn</a>
          <a href="/support" style={styles.navItem}>🎫 Hỗ Trợ</a>
          <a href="/rank">🏆 Bảng Xếp Hạng</a>
          <a href="/settings" style={styles.navItem}>⚙️ Cài Đặt</a>
          <button onClick={logout} style={styles.navButton}>↪ Đăng xuất</button>

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
          <div style={styles.headerLeft}>
            <button style={styles.menuBtn}>☰</button>
            <div style={styles.searchWrap}>
              <input
                placeholder="Tìm sản phẩm..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={styles.search}
              />
              <span style={styles.searchIcon}>⌕</span>
            </div>
          </div>

          {user ? (
            <div style={styles.userArea}>
              <button style={styles.toggleBtn}>🌙</button>
              <div style={styles.notifyWrap}>
                🔔 <span style={styles.notifyBadge}>3</span>
              </div>

              <div style={styles.userWrap}>
                <div style={styles.userHead} onClick={() => setShowUserMenu(!showUserMenu)}>
                  <div style={styles.avatar}>
                    {(user.name || user.email || "T").charAt(0).toUpperCase()}
                  </div>
                  <span style={styles.userName}>{user.name || user.email}</span>
                  <span>⌄</span>
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
            <div style={styles.authBox}>
              <a href="/login" style={styles.loginBtn}>Đăng nhập</a>
              <a href="/register" style={styles.registerBtn}>Đăng ký</a>
            </div>
          )}
        </header>

        <section style={styles.content}>
          {user?.role === "ADMIN" && (
  <div style={styles.statsGrid}>
    <div style={styles.statCard}>
      👤 {stats.totalUsers.toLocaleString("vi-VN")}
      <div style={{ fontSize: 13, marginTop: 8 }}>
        Người dùng
      </div>
    </div>

    <div style={styles.statCard}>
      📦 {stats.totalOrders.toLocaleString("vi-VN")}
      <div style={{ fontSize: 13, marginTop: 8 }}>
        Đơn hàng
      </div>
    </div>

    <div style={styles.statCard}>
      💰 {stats.totalDeposit.toLocaleString("vi-VN")}đ
      <div style={{ fontSize: 13, marginTop: 8 }}>
        Tổng nạp
      </div>
    </div>

    <div style={styles.statCard}>
      📥 {stats.stockLeft.toLocaleString("vi-VN")}
      <div style={{ fontSize: 13, marginTop: 8 }}>
        Tồn kho
      </div>
    </div>
  </div>
)}
{user && user.role !== "ADMIN" && (
  <div style={styles.statsGrid}>
    <div style={styles.statCard}>
      💰 {(user.balance || 0).toLocaleString("vi-VN")}đ
      <div style={{ fontSize: 13, marginTop: 8 }}>
        Số dư của tôi
      </div>
    </div>

    <div style={styles.statCard}>
      💵 {(user.totalDeposit || 0).toLocaleString("vi-VN")}đ
      <div style={{ fontSize: 13, marginTop: 8 }}>
        Tổng đã nạp
      </div>
    </div>

    <div style={styles.statCard}>
  🏆 {getUserRank(user.totalDeposit || 0)}
      <div style={{ fontSize: 13, marginTop: 8 }}>
  Hạng tài khoản
</div>
    </div>

    <div style={styles.statCard}>
      📅 {new Date(user.createdAt).toLocaleDateString("vi-VN")}
      <div style={{ fontSize: 13, marginTop: 8 }}>
        Ngày tham gia
      </div>
    </div>
  </div>
)}

{user && user.role !== "ADMIN" && (
  <div style={styles.rankBox}>
    {getNextRankInfo(user.totalDeposit || 0).need > 0 ? (
      <>
        📈 Cần nạp thêm{" "}
        <span style={{ color: "#22d3ee" }}>
          {getNextRankInfo(user.totalDeposit || 0).need.toLocaleString("vi-VN")}đ
        </span>{" "}
        để lên hạng{" "}
        <span style={{ color: "#f59e0b" }}>
          {getNextRankInfo(user.totalDeposit || 0).nextRank}
        </span>
      </>
    ) : (
      <>💎 Bạn đã đạt hạng cao nhất</>
    )}
  </div>
)}
  
          <div style={styles.notice}>
            <div style={styles.noticeIcon}>🛡️</div>
            <div>
              <b style={styles.hotText}>
                Bảo hành đăng nhập lần đầu trong 1 ngày kể từ lúc mua hàng.
              </b>
              <p style={styles.noticeP}>
                Nên mua số lượng đủ làm trong ngày và nên mua ít kiểm tra trước.
              </p>
              <p style={styles.noticeP}>
                <b>Bảo hành <span style={{ color: "#22d3ee" }}>6 giờ</span></b> kể từ thời điểm giao tài khoản.
                <br />
                {settings.noticeText}
              </p>
              <p style={styles.cyanText}>
                Link tải tool đọc OTP toàn bộ các email hotmail, Mail Domain có trên web.
                <br />
                Tính năng copy và input toàn bộ thông tin username|pass|email.
                <br />
                Tự động nhận dạng email input cần lựa chọn email đọc.
              </p>
              <p style={styles.noticeP}>
                • Nhóm thông báo <b>SUPPORT HỖ TRỢ</b>{" "}
                <span style={{ color: "#22d3ee" }}>ZALO</span>
              </p>
              <b style={styles.warning}>⚠ Lưu ý: Mọi hành vi sử dụng vào các mục đích vi phạm pháp luật đều bị cấm.</b>
            </div>
          </div>

          <div style={styles.linkBar}>
  🔥 {settings.noticeText} | 🚀 Shop giao tài khoản tự động 24/7 |
  💎 Bảo hành nhanh | ⚡ Hỗ trợ Zalo tức thì
</div>

          <div style={styles.categoryGrid}>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCat(cat.name)}
                style={{
                  ...styles.catBtn,
                  borderColor: activeCat === cat.name ? "#ff2b6d" : "rgba(255,255,255,.12)",
                  boxShadow:
                    activeCat === cat.name
                      ? "0 0 18px rgba(255,43,109,.45), inset 0 0 12px rgba(34,211,238,.12)"
                      : "none",
                }}
              >
                <span>{cat.icon}</span> {cat.name === "TẤT CẢ" ? "TẤT CẢ SẢN PHẨM" : cat.name}
              </button>
            ))}
          </div>

          <div style={styles.tableBox}>
            <div style={styles.groupTitle}>
              <img src="/tiktok-logo.png" style={styles.groupLogo} />
              <span>TT Việt</span>
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
                    <div style={styles.productName}>
  🔥 {p.name}
  {p.stock > 0 && (
    <span style={styles.hotBadge}> Còn hàng</span>
  )}
</div>
                    <div style={styles.desc}>
                      Bảo hành 6 tiếng tính từ lúc mua. Hàng tự động giao ngay.
                    </div>
                  </div>
                </div>

                <div style={styles.stockBox}>Còn lại: <b>{p.stock}</b></div>

                <div style={styles.priceBox}>
                  💵 {p.price.toLocaleString("vi-VN")}đ
                </div>

                <button
                  onClick={() => openBuyPopup(p)}
                  disabled={p.stock <= 0}
                  style={{
                    ...styles.buyBtn,
                    background: p.stock > 0
                      ? "linear-gradient(90deg,#06b6d4,#ec4899)"
                      : "#475569",
                    cursor: p.stock > 0 ? "pointer" : "not-allowed",
                  }}
                >
                  {p.stock > 0 ? "🛒 MUA NGAY" : "☹ HẾT HÀNG"}
                </button>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}>📦</div>
                Không có sản phẩm phù hợp.
              </div>
            )}
          </div>

          <div style={styles.topBox}>
            <div style={styles.activityTitle}>🏆 TOP NẠP TIỀN</div>

            {topDeposits.map((u: any, index: number) => (
              <div key={u.id} style={styles.topRow}>
                <span>
                  {index === 0 && "🥇 "}
                  {index === 1 && "🥈 "}
                  {index === 2 && "🥉 "}
                  {index > 2 && `#${index + 1} `}
                  <b>{u.user}</b>
                </span>

                <b style={{ color: "#22d3ee" }}>
                  {Number(u.totalDeposit || 0).toLocaleString("vi-VN")}đ
                </b>
              </div>
            ))}

            {topDeposits.length === 0 && (
              <div style={styles.activityEmpty}>Chưa có dữ liệu top nạp</div>
            )}
          </div>

          <div style={styles.topBox}>
            <div style={styles.activityTitle}>🛒 TOP MUA HÀNG</div>

            {topOrders.map((u: any, index: number) => (
              <div key={u.id} style={styles.topRow}>
                <span>
                  {index === 0 && "🥇 "}
                  {index === 1 && "🥈 "}
                  {index === 2 && "🥉 "}
                  {index > 2 && `#${index + 1} `}
                  <b>{u.user}</b>
                </span>

                <b style={{ color: "#22d3ee" }}>
                  {Number(u.totalBuy || 0).toLocaleString("vi-VN")}đ
                </b>
              </div>
            ))}

            {topOrders.length === 0 && (
              <div style={styles.activityEmpty}>Chưa có dữ liệu top mua</div>
            )}
          </div>

          <div style={styles.activityGrid}>
            <div style={styles.activityBox}>
              <div style={styles.activityTitle}>ĐƠN HÀNG GẦN ĐÂY</div>

              <div style={styles.activityList}>
                {activity.orders.map((o: any) => (
                  <div key={o.id} style={styles.activityRow}>
                    🛒 <b style={{ color: "#16a34a" }}>{o.user}</b>{" "}
                    mua <b style={{ color: "#ef4444" }}>{o.quantity || 1}</b>{" "}
                    {o.productName || "Sản phẩm"} -{" "}
                    <b style={{ color: "#2563eb" }}>
                      {Number(o.amount || 0).toLocaleString("vi-VN")}đ
                    </b>
                  </div>
                ))}

                {activity.orders.length === 0 && (
                  <div style={styles.activityEmpty}>Chưa có đơn hàng</div>
                )}
              </div>
            </div>

            <div style={styles.activityBox}>
              <div style={styles.activityTitle}>NẠP TIỀN GẦN ĐÂY</div>

              <div style={styles.activityList}>
                {activity.deposits.map((d: any) => (
                  <div key={d.id} style={styles.activityRow}>
                    💳 <b style={{ color: "#16a34a" }}>{d.user}</b>{" "}
                    thực hiện nạp{" "}
                    <b style={{ color: "#2563eb" }}>
                      {Number(d.amount || 0).toLocaleString("vi-VN")}đ
                    </b>{" "}
                    - <b style={{ color: "#ef4444" }}>{d.bank || "BANK"}</b>
                  </div>
                ))}

                {activity.deposits.length === 0 && (
                  <div style={styles.activityEmpty}>Chưa có giao dịch nạp</div>
                )}
              </div>
            </div>
          </div>
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

              <div style={styles.couponRow}>
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã giảm giá"
                  style={styles.couponInput}
                />

                <button style={styles.discountBtn} onClick={checkCoupon}>
                  Áp dụng
                </button>
              </div>

              {coupon && (
                <div style={styles.couponSuccess}>
                  ✅ Đã áp dụng mã {coupon.code} - Giảm {coupon.type === "PERCENT" ? `${coupon.value}%` : `${Number(coupon.value || 0).toLocaleString("vi-VN")}đ`}
                </div>
              )}

              <div style={styles.totalText}>
                Tổng tiền cần thanh toán: {" "}
                <b style={{ color: "#ff2b6d" }}>
                  {finalPrice.toLocaleString("vi-VN")}đ
                </b>
              </div>

              {discountAmount > 0 && (
                <div style={styles.discountText}>
                  Đã giảm: {discountAmount.toLocaleString("vi-VN")}đ
                </div>
              )}

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
  page: {
    minHeight: "100vh",
    background: "#090b10",
    color: "#f8fafc",
    fontFamily: "Arial, sans-serif",
    display: "flex",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 16,
    marginBottom: 20,
  },

  statCard: {
    background:
      "linear-gradient(135deg,rgba(255,255,255,.05),rgba(255,255,255,.02))",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 12,
    padding: 20,
    textAlign: "center",
    fontSize: 22,
    fontWeight: 900,
    color: "#fff",
  },

  sidebar: {
    width: 260,
    minHeight: "100vh",
    background: "linear-gradient(180deg,#111318,#050608)",
    borderRight: "1px solid rgba(255,255,255,.08)",
    color: "white",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 20,
  },

  logoBox: {
    height: 78,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 16px",
    borderBottom: "1px solid rgba(255,255,255,.08)",
  },

  logoImg: {
    width: 58,
    height: 58,
    objectFit: "cover",
    borderRadius: 12,
    border: "1px solid #22d3ee",
    boxShadow: "0 0 18px rgba(34,211,238,.35)",
  },

  logoText: {
    fontSize: 25,
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1,
  },

  logoDomain: {
    fontSize: 12,
    color: "#d1d5db",
    marginTop: 5,
  },

  onlineDot: {
    width: 8,
    height: 8,
    background: "#22c55e",
    borderRadius: "50%",
    marginLeft: "auto",
  },

  sideInfo: {
    padding: "14px 22px",
    fontSize: 14,
    color: "#e5e7eb",
  },

  balance: {
    padding: "18px 22px",
    color: "#e5e7eb",
    fontSize: 14,
  },

  nav: {
    display: "grid",
    gap: 8,
    padding: "8px 0",
  },

  navItem: {
    color: "#e5e7eb",
    textDecoration: "none",
    padding: "14px 22px",
    fontWeight: 800,
    fontSize: 15,
  },

  navActive: {
    color: "white",
    textDecoration: "none",
    padding: "16px 22px",
    fontWeight: 900,
    background:
      "linear-gradient(90deg,rgba(34,211,238,.18),rgba(236,72,153,.12))",
    borderRight: "3px solid #ff2b6d",
    boxShadow: "inset 0 0 18px rgba(255,255,255,.04)",
  },

  navButton: {
    color: "#ff2b6d",
    padding: "14px 22px",
    background: "transparent",
    border: 0,
    textAlign: "left",
    fontWeight: 900,
    fontSize: 15,
    cursor: "pointer",
  },

  main: {
    marginLeft: 260,
    width: "calc(100% - 260px)",
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top right,rgba(236,72,153,.16),transparent 28%), radial-gradient(circle at top left,rgba(34,211,238,.12),transparent 26%), #090b10",
  },

  header: {
    height: 76,
    background: "rgba(12,14,20,.88)",
    borderBottom: "1px solid rgba(255,255,255,.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    position: "sticky",
    top: 0,
    zIndex: 10,
    backdropFilter: "blur(14px)",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },

  menuBtn: {
    background: "transparent",
    border: 0,
    color: "#9ca3af",
    fontSize: 26,
    cursor: "pointer",
  },

  searchWrap: {
    position: "relative",
  },

  search: {
    width: 360,
    background: "#0f1117",
    color: "white",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 10,
    padding: "13px 42px 13px 16px",
    outline: "none",
    fontSize: 15,
  },

  searchIcon: {
    position: "absolute",
    right: 14,
    top: 10,
    color: "#d1d5db",
    fontSize: 22,
  },

  userArea: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    position: "relative",
  },

  toggleBtn: {
    width: 60,
    height: 32,
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,.12)",
    background: "#151821",
    color: "#ff2b6d",
    cursor: "pointer",
  },

  notifyWrap: {
    position: "relative",
    fontSize: 22,
  },

  notifyBadge: {
    position: "absolute",
    top: -10,
    right: -12,
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

  userWrap: {
    position: "relative",
  },

  userHead: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    color: "white",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "#111827",
    color: "#22d3ee",
    border: "1px solid #22d3ee",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: 18,
  },

  userName: {
    fontWeight: 800,
  },

  dropdown: {
    position: "absolute",
    top: 56,
    right: 0,
    width: 230,
    background: "#101219",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 12,
    boxShadow: "0 20px 60px rgba(0,0,0,.5)",
    padding: "10px 0",
    zIndex: 99,
  },

  dropItem: {
    display: "block",
    padding: "12px 18px",
    color: "#e5e7eb",
    textDecoration: "none",
    fontSize: 14,
  },

  dropBtn: {
    display: "block",
    width: "100%",
    padding: "12px 18px",
    color: "#ff2b6d",
    background: "transparent",
    border: 0,
    textAlign: "left",
    fontSize: 14,
    cursor: "pointer",
  },

  authBox: {
    display: "flex",
    gap: 10,
  },

  loginBtn: {
    background: "#111827",
    color: "white",
    padding: "10px 16px",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 800,
    border: "1px solid rgba(255,255,255,.16)",
  },

  registerBtn: {
    background: "linear-gradient(90deg,#06b6d4,#ec4899)",
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
    display: "flex",
    gap: 28,
    background:
      "linear-gradient(135deg,rgba(255,255,255,.045),rgba(255,255,255,.015))",
    border: "1px solid rgba(255,255,255,.12)",
    borderRight: "2px solid #ff2b6d",
    borderLeft: "1px solid #22d3ee",
    borderRadius: 12,
    padding: 28,
    marginBottom: 16,
    boxShadow: "0 20px 50px rgba(0,0,0,.25)",
  },

  noticeIcon: {
    width: 82,
    height: 82,
    borderRadius: 14,
    border: "1px solid #22d3ee",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 44,
    boxShadow: "0 0 25px rgba(34,211,238,.18)",
  },

  hotText: {
    color: "#ff2b6d",
  },

  noticeP: {
    color: "#f3f4f6",
    lineHeight: 1.6,
    margin: "7px 0",
  },

  cyanText: {
    color: "#22d3ee",
    lineHeight: 1.7,
  },

  warning: {
    color: "#ff2b6d",
  },

  linkBar: {
  height: 50,
  borderRadius: 10,
  marginBottom: 22,
  padding: "0 22px",
  display: "flex",
  alignItems: "center",
  overflow: "hidden",
  background:
    "linear-gradient(90deg,rgba(34,211,238,.12),rgba(236,72,153,.8))",
  color: "white",
  fontWeight: 900,
},


  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6,1fr)",
    gap: 14,
    marginBottom: 24,
  },

  catBtn: {
    height: 58,
    background: "rgba(255,255,255,.035)",
    color: "white",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 10,
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 15,
  },

  tableBox: {
    background:
      "linear-gradient(135deg,rgba(255,255,255,.045),rgba(255,255,255,.018))",
    border: "1px solid rgba(255,255,255,.12)",
    borderRight: "2px solid #ff2b6d",
    borderLeft: "1px solid #22d3ee",
    borderRadius: 12,
    overflow: "hidden",
  },

  groupTitle: {
    height: 80,
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    fontWeight: 900,
    fontSize: 18,
    color: "white",
    borderBottom: "1px solid rgba(255,255,255,.08)",
  },

  groupLogo: {
    width: 46,
    height: 46,
    borderRadius: 8,
    objectFit: "cover",
    border: "1px solid #22d3ee",
  },

  tableHead: {
    display: "grid",
    gridTemplateColumns: "1fr 160px 170px 190px",
    color: "white",
    fontWeight: 900,
    padding: "18px 28px",
    borderBottom: "1px solid rgba(255,255,255,.09)",
  },

  tableRow: {
    display: "grid",
    gridTemplateColumns: "1fr 160px 170px 190px",
    alignItems: "center",
    padding: "16px 28px",
    borderBottom: "1px solid rgba(255,255,255,.07)",
  },

  productInfo: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },

  productLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    objectFit: "cover",
  },

  productName: {
  fontWeight: 900,
  color: "#22d3ee",
  fontSize: 15,
},

hotBadge: {
  marginLeft: 8,
  background: "linear-gradient(90deg,#f97316,#ec4899)",
  color: "white",
  padding: "3px 7px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 900,
},

  desc: {
    color: "#d1d5db",
    fontSize: 13,
    lineHeight: 1.5,
    marginTop: 4,
  },

  stockBox: {
    justifySelf: "center",
    color: "#22d3ee",
    border: "1px solid rgba(34,211,238,.35)",
    borderRadius: 8,
    padding: "7px 12px",
    background: "rgba(34,211,238,.05)",
  },

  priceBox: {
    justifySelf: "center",
    color: "#fff",
    border: "1px solid rgba(255,43,109,.45)",
    borderRadius: 8,
    padding: "7px 12px",
    background: "rgba(255,43,109,.06)",
    fontWeight: 900,
  },

  buyBtn: {
    width: 150,
    padding: "11px",
    color: "white",
    border: 0,
    borderRadius: 8,
    fontWeight: 900,
    justifySelf: "center",
  },

  empty: {
    textAlign: "center",
    color: "#d1d5db",
    padding: 50,
    fontSize: 16,
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 10,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.65)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  buyModal: {
    width: 520,
    background: "#101219",
    color: "white",
    borderRadius: 14,
    padding: 28,
    position: "relative",
    boxShadow: "0 20px 70px rgba(0,0,0,.55)",
    border: "1px solid rgba(255,255,255,.12)",
  },

  closeModal: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    border: 0,
    borderRadius: 8,
    background: "#ff2b6d",
    color: "white",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 900,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: 900,
    marginBottom: 24,
  },

  label: {
    display: "block",
    marginBottom: 8,
    fontWeight: 700,
  },

  productInput: {
    background: "#1f2937",
    padding: 14,
    borderRadius: 8,
    marginBottom: 18,
    color: "white",
  },

  qtyInput: {
    width: "100%",
    padding: 14,
    border: "1px solid rgba(255,255,255,.12)",
    background: "#0f172a",
    color: "white",
    borderRadius: 8,
    marginBottom: 18,
    fontSize: 16,
  },

  discountBtn: {
    background: "#ff2b6d",
    color: "white",
    border: 0,
    borderRadius: 8,
    padding: "12px 18px",
    fontWeight: 900,
    cursor: "pointer",
    height: 48,
    whiteSpace: "nowrap",
  },

  couponRow: {
    display: "flex",
    gap: 10,
    marginBottom: 14,
  },

  couponInput: {
    flex: 1,
    padding: 14,
    border: "1px solid rgba(255,255,255,.12)",
    background: "#0f172a",
    color: "white",
    borderRadius: 8,
    fontSize: 16,
    outline: "none",
  },

  couponSuccess: {
    color: "#22c55e",
    fontWeight: 800,
    marginBottom: 14,
    textAlign: "center",
  },

  discountText: {
    color: "#22d3ee",
    textAlign: "center",
    fontWeight: 800,
    marginTop: -14,
    marginBottom: 18,
  },

  totalText: {
    clear: "both",
    textAlign: "center",
    fontSize: 22,
    margin: "28px 0",
  },

  payButton: {
    width: "100%",
    background: "linear-gradient(90deg,#06b6d4,#ec4899)",
    color: "white",
    border: 0,
    borderRadius: 8,
    padding: 15,
    fontSize: 17,
    fontWeight: 900,
    cursor: "pointer",
  },
  adminPanel: {
  margin: "0 12px 14px",
  padding: 12,
  borderRadius: 10,
  background:
    "linear-gradient(135deg,rgba(34,211,238,.08),rgba(236,72,153,.08))",
  border: "1px solid rgba(255,255,255,.12)",
},

adminTitle: {
  textAlign: "center",
  color: "#22d3ee",
  fontWeight: 900,
  marginBottom: 10,
  fontSize: 13,
},

adminBtn: {
  display: "block",
  textDecoration: "none",
  color: "white",
  padding: "10px 12px",
  marginBottom: 6,
  borderRadius: 8,
  background: "rgba(255,255,255,.05)",
  fontWeight: 700,
},

  topBox: {
    background:
      "linear-gradient(135deg,rgba(255,255,255,.04),rgba(255,255,255,.02))",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    color: "white",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "13px 16px",
    borderBottom: "1px solid rgba(255,255,255,.08)",
    color: "#e5e7eb",
    fontSize: 14,
  },

  activityGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginTop: 25,
  },

  activityBox: {
    background: "#f8fafc",
    borderRadius: 10,
    overflow: "hidden",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
  },

  activityTitle: {
    background: "#1e3a8a",
    color: "white",
    fontWeight: 900,
    padding: "16px 18px",
    fontSize: 17,
  },

  activityList: {
    maxHeight: 360,
    overflowY: "auto",
  },

  activityRow: {
    padding: "13px 16px",
    borderBottom: "1px solid #e5e7eb",
    color: "#111827",
    lineHeight: 1.5,
    fontSize: 14,
  },

  activityEmpty: {
    padding: 20,
    textAlign: "center",
    color: "#64748b",
  },


  rankBox: {
    background:
      "linear-gradient(135deg,rgba(34,211,238,.08),rgba(236,72,153,.08))",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "white",
    fontWeight: 900,
  },
};
