"use client";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  async function loadUsers() {
    const res = await fetch("/api/admin-users");
    const data = await res.json();
    setUsers(data.users || []);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function changeBalance(userId: string, type: "add" | "sub") {
    const value = prompt(
      type === "add" ? "Nhập số tiền cộng" : "Nhập số tiền trừ"
    );

    if (!value) return;

    const res = await fetch("/api/admin-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        type,
        amount: Number(value),
      }),
    });

    if (res.ok) {
      alert("Đã cập nhật số dư");
      loadUsers();
    } else {
      alert("Lỗi cập nhật");
    }
  }

  return (
    <main style={page}>
      <Top title="Quản lý User" />

      <div style={table}>
        <div style={head}>
          <div style={cell}>Email</div>
          <div style={cell}>Tên</div>
          <div style={cell}>Số dư</div>
          <div style={cell}>Role</div>
          <div style={cell}>Đơn</div>
          <div style={cell}>Ngày tạo</div>
          <div style={cell}>Thao tác</div>
        </div>

        {users.map((u) => (
          <div key={u.id} style={row}>
            <div style={cell}>{u.email}</div>
            <div style={cell}>{u.name || "-"}</div>
            <div style={{ ...cell, fontWeight: 900, color: "#16a34a" }}>
              {u.balance.toLocaleString("vi-VN")}đ
            </div>
            <div style={cell}>{u.role || "USER"}</div>
            <div style={cell}>{u.orders}</div>
            <div style={cell}>
              {new Date(u.createdAt).toLocaleDateString("vi-VN")}
            </div>
            <div style={cell}>
              <button style={btn} onClick={() => changeBalance(u.id, "add")}>
                + Tiền
              </button>
              <button
                style={{ ...btn, background: "#dc2626", marginLeft: 6 }}
                onClick={() => changeBalance(u.id, "sub")}
              >
                - Tiền
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function Top({ title }: any) {
  return (
    <>
      <h1>{title}</h1>
      <div style={{ marginBottom: 20 }}>
        <a href="/admin/dashboard">Dashboard</a> |{" "}
        <a href="/admin">Sản phẩm</a> |{" "}
        <a href="/admin/orders">Đơn hàng</a> |{" "}
        <a href="/admin/stock">Kho tài khoản</a>
      </div>
    </>
  );
}

const page: any = {
  padding: 30,
  fontFamily: "Arial",
  background: "#f3f6fb",
  minHeight: "100vh",
};

const table: any = {
  background: "white",
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 6px 18px rgba(0,0,0,.08)",
};

const head: any = {
  display: "grid",
  gridTemplateColumns: "220px 130px 130px 90px 70px 110px 180px",
  background: "#263f83",
  color: "white",
  fontWeight: 900,
};

const row: any = {
  display: "grid",
  gridTemplateColumns: "220px 130px 130px 90px 70px 110px 180px",
  borderTop: "1px solid #ddd",
  alignItems: "center",
};

const cell: any = {
  padding: 12,
  fontSize: 14,
};

const btn: any = {
  background: "#2563eb",
  color: "white",
  border: 0,
  padding: "8px 10px",
  borderRadius: 6,
  fontWeight: 800,
};