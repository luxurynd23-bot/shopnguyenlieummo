"use client";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    setLoading(true);

    try {
      const res = await fetch("/api/admin-users");
      const data = await res.json();

      if (res.ok) {
        setUsers(data.users || []);
      } else {
        alert(data.message || "Không có quyền truy cập");
      }
    } catch {
      alert("Lỗi tải danh sách user");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function changeBalance(userId: string, type: "add" | "minus") {
    const amount = prompt(
      type === "add" ? "Nhập số tiền muốn cộng:" : "Nhập số tiền muốn trừ:"
    );

    if (!amount) return;

    const res = await fetch("/api/admin-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "balance",
        userId,
        type,
        amount: Number(amount),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message || "Đã cập nhật số dư");
      loadUsers();
    } else {
      alert(data.message || "Lỗi cập nhật số dư");
    }
  }

  async function changeRole(userId: string, role: "ADMIN" | "USER") {
    if (!confirm(`Bạn có chắc muốn đổi quyền thành ${role}?`)) return;

    const res = await fetch("/api/admin-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "setRole",
        userId,
        role,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message || "Đã cập nhật quyền");
      loadUsers();
    } else {
      alert(data.message || "Lỗi cập nhật quyền");
    }
  }

  async function changeVip(userId: string, vipLevel: string) {
    const res = await fetch("/api/admin-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "setVip",
        userId,
        vipLevel,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message || "Đã cập nhật VIP");
      loadUsers();
    } else {
      alert(data.message || "Lỗi cập nhật VIP");
    }
  }
async function toggleBan(
  userId: string,
  isBanned: boolean
) {
  const res = await fetch("/api/admin-users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "toggleBan",
      userId,
      isBanned,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    alert(data.message);
    loadUsers();
  } else {
    alert(data.message || "Lỗi");
  }
}
  return (
    <main style={styles.page}>
      <AdminNav />

      <div style={styles.headerBox}>
        <h1 style={styles.title}>👤 Quản lý Users</h1>

        <button onClick={loadUsers} style={styles.reloadBtn}>
          ↻ Tải lại
        </button>
      </div>

      {loading ? (
        <p style={styles.loading}>Đang tải...</p>
      ) : (
        <div style={styles.tableBox}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Tên</th>
                <th style={styles.th}>Số dư</th>
                <th style={styles.th}>Tổng nạp</th>
                <th style={styles.th}>Hoa hồng</th>
                <th style={styles.th}>VIP</th>
                <th style={styles.th}>Trạng thái</th>
                <th style={styles.th}>Quyền</th>     
                <th style={styles.th}>Ngày tạo</th>
                <th style={styles.th}>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={styles.td}>{u.email}</td>

                  <td style={styles.td}>{u.name || "-"}</td>

                  <td style={styles.td}>
                    {Number(u.balance || 0).toLocaleString("vi-VN")}đ
                  </td>

                  <td style={styles.td}>
                    {Number(u.totalDeposit || 0).toLocaleString("vi-VN")}đ
                  </td>

                  <td style={styles.td}>
                    {Number(u.referralBalance || 0).toLocaleString("vi-VN")}đ
                  </td>

                  <td style={styles.td}>
                    <select
                      value={u.vipLevel || "BRONZE"}
                      onChange={(e) => changeVip(u.id, e.target.value)}
                      style={styles.select}
                    >
                      <option value="BRONZE">🥉 BRONZE</option>
                      <option value="SILVER">🥈 SILVER</option>
                      <option value="GOLD">🥇 GOLD</option>
                      <option value="DIAMOND">💎 DIAMOND</option>
                    </select>
                  </td>
<td style={styles.td}>
  {u.isBanned ? (
    <span style={{ color: "#ef4444", fontWeight: 900 }}>
      🔴 Bị khóa
    </span>
  ) : (
    <span style={{ color: "#22c55e", fontWeight: 900 }}>
      🟢 Hoạt động
    </span>
  )}
</td>
                  <td style={styles.td}>
                    <b
                      style={{
                        color: u.role === "ADMIN" ? "#22c55e" : "#38bdf8",
                      }}
                    >
                      {u.role}
                    </b>
                  </td>

                  <td style={styles.td}>
                    {new Date(u.createdAt).toLocaleString("vi-VN")}
                  </td>

                  <td style={styles.td}>
                    <button
                      style={styles.addBtn}
                      onClick={() => changeBalance(u.id, "add")}
                    >
                      + Tiền
                    </button>

                    <button
                      style={styles.subBtn}
                      onClick={() => changeBalance(u.id, "minus")}
                    >
                      - Tiền
                    </button>

                    <button
                      style={styles.adminBtn}
                      onClick={() => changeRole(u.id, "ADMIN")}
                    >
                      Cấp ADMIN
                    </button>

                    <button
  style={styles.userBtn}
  onClick={() => changeRole(u.id, "USER")}
>
  Hạ USER
</button>

<button
  style={styles.detailBtn}
  onClick={() => {
    window.location.href = "/admin/users/" + u.id;
  }}
>
  Chi tiết
</button>

                    {u.isBanned ? (
  <button
    style={styles.unbanBtn}
    onClick={() => toggleBan(u.id, false)}
  >
    Mở khóa
  </button>
) : (
  <button
    style={styles.banBtn}
    onClick={() => toggleBan(u.id, true)}
  >
    Khóa
  </button>
)}
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={10} style={styles.empty}>
                    Chưa có user
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function AdminNav() {
  return (
    <div style={styles.nav}>
      <a href="/" style={styles.homeBtn}>← Trang chủ</a>
      <a href="/admin/dashboard" style={styles.navBtn}>📊 Dashboard</a>
      <a href="/admin" style={styles.navBtn}>📦 Sản phẩm</a>
      <a href="/admin/stock" style={styles.navBtn}>📥 Kho</a>
      <a href="/admin/orders" style={styles.navBtn}>📋 Đơn hàng</a>
      <a href="/admin/users" style={styles.activeBtn}>👤 Users</a>
      <a href="/admin/tickets" style={styles.navBtn}>🎫 Tickets</a>
      <a href="/admin/coupons" style={styles.navBtn}>🎟 Coupon</a>
      <a href="/admin/settings" style={styles.navBtn}>⚙️ Cài đặt</a>
    </div>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
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
    borderRadius: 12,
    background: "rgba(15,23,42,.85)",
    border: "1px solid rgba(255,255,255,.12)",
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
    marginBottom: 20,
    gap: 14,
  },

  title: {
    fontSize: 30,
    margin: 0,
  },

  reloadBtn: {
    background: "#334155",
    color: "white",
    border: 0,
    padding: "10px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800,
  },

  loading: {
    color: "#cbd5e1",
    fontWeight: 700,
  },

  tableBox: {
    background: "#111827",
    borderRadius: 12,
    overflow: "auto",
    border: "1px solid rgba(255,255,255,.12)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: 14,
    borderBottom: "1px solid rgba(255,255,255,.12)",
    color: "#93c5fd",
    whiteSpace: "nowrap",
  },

  td: {
    padding: 14,
    borderBottom: "1px solid rgba(255,255,255,.08)",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },

  select: {
    background: "#020617",
    color: "white",
    border: "1px solid rgba(255,255,255,.18)",
    borderRadius: 8,
    padding: "8px 10px",
    fontWeight: 800,
  },

  empty: {
    textAlign: "center",
    padding: 30,
    color: "#cbd5e1",
  },

  addBtn: {
    background: "#16a34a",
    color: "white",
    border: 0,
    padding: "8px 10px",
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
    cursor: "pointer",
    fontWeight: 700,
  },

  subBtn: {
    background: "#dc2626",
    color: "white",
    border: 0,
    padding: "8px 10px",
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
    cursor: "pointer",
    fontWeight: 700,
  },

  adminBtn: {
    background: "#2563eb",
    color: "white",
    border: 0,
    padding: "8px 10px",
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
    cursor: "pointer",
    fontWeight: 700,
  },

  userBtn: {
  background: "#64748b",
  color: "white",
  border: 0,
  padding: "8px 10px",
  borderRadius: 6,
  marginBottom: 6,
  cursor: "pointer",
  fontWeight: 700,
},

detailBtn: {
  background: "#7c3aed",
  color: "white",
  border: 0,
  padding: "8px 10px",
  borderRadius: 6,
  marginBottom: 6,
  cursor: "pointer",
  fontWeight: 700,
},

banBtn: {
  background: "#dc2626",
  color: "white",
  border: 0,
  padding: "8px 10px",
  borderRadius: 6,
  marginRight: 6,
  marginBottom: 6,
  cursor: "pointer",
  fontWeight: 700,
},

unbanBtn: {
  background: "#16a34a",
  color: "white",
  border: 0,
  padding: "8px 10px",
  borderRadius: 6,
  marginRight: 6,
  marginBottom: 6,
  cursor: "pointer",
  fontWeight: 700,
},
};