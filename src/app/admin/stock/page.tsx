"use client";

import { useEffect, useState } from "react";

export default function AdminStockPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  async function loadItems() {
    const res = await fetch("/api/admin-stock-items");
    const data = await res.json();
    setItems(data.items || []);
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function deleteItem(id: string) {
    if (!confirm("Xóa tài khoản này khỏi kho?")) return;

    const res = await fetch("/api/admin-stock-items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      alert("Đã xóa");
      loadItems();
    } else {
      alert("Lỗi xóa");
    }
  }

  const filtered = items.filter((i) => {
    const matchStatus =
      filter === "ALL" ||
      (filter === "SOLD" && i.sold) ||
      (filter === "UNSOLD" && !i.sold);

    const matchKeyword =
      i.productName.toLowerCase().includes(keyword.toLowerCase()) ||
      i.content.toLowerCase().includes(keyword.toLowerCase());

    return matchStatus && matchKeyword;
  });

  return (
    <main style={page}>
      <h1>Quản lý kho tài khoản</h1>

      <div style={{ marginBottom: 20 }}>
        <a href="/admin/dashboard">Dashboard</a> |{" "}
        <a href="/admin">Sản phẩm</a> |{" "}
        <a href="/admin/orders">Đơn hàng</a> |{" "}
        <a href="/admin/users">Users</a>
      </div>

      <section style={box}>
        <input
          placeholder="Tìm sản phẩm hoặc tài khoản..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={input}
        />

        <div style={{ marginTop: 12 }}>
          <button onClick={() => setFilter("ALL")} style={filter === "ALL" ? activeBtn : btn}>
            Tất cả
          </button>
          <button onClick={() => setFilter("UNSOLD")} style={filter === "UNSOLD" ? activeBtn : btn}>
            Chưa bán
          </button>
          <button onClick={() => setFilter("SOLD")} style={filter === "SOLD" ? activeBtn : btn}>
            Đã bán
          </button>
        </div>

        <p>
          Tổng hiển thị: <b>{filtered.length}</b>
        </p>
      </section>

      <div style={table}>
        <div style={head}>
          <div style={cell}>Sản phẩm</div>
          <div style={cell}>Tài khoản</div>
          <div style={cell}>Trạng thái</div>
          <div style={cell}>Ngày nhập</div>
          <div style={cell}>Thao tác</div>
        </div>

        {filtered.map((i) => (
          <div key={i.id} style={row}>
            <div style={cell}>
              <b>{i.productName}</b>
            </div>

            <pre style={{ ...cell, whiteSpace: "pre-wrap" }}>{i.content}</pre>

            <div style={cell}>
              {i.sold ? (
                <span style={{ color: "#dc2626", fontWeight: 900 }}>Đã bán</span>
              ) : (
                <span style={{ color: "#16a34a", fontWeight: 900 }}>Chưa bán</span>
              )}
            </div>

            <div style={cell}>{new Date(i.createdAt).toLocaleString("vi-VN")}</div>

            <div style={cell}>
              <button
                style={btn}
                onClick={() => navigator.clipboard.writeText(i.content || "")}
              >
                Copy
              </button>

              {!i.sold && (
                <button
                  style={{ ...btn, background: "#dc2626", marginLeft: 6 }}
                  onClick={() => deleteItem(i.id)}
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

const page: any = {
  padding: 30,
  fontFamily: "Arial",
  background: "#f3f6fb",
  minHeight: "100vh",
};

const box: any = {
  background: "white",
  padding: 18,
  borderRadius: 12,
  marginBottom: 18,
  boxShadow: "0 6px 18px rgba(0,0,0,.08)",
};

const input: any = {
  width: "100%",
  padding: 12,
  border: "1px solid #cbd5e1",
  borderRadius: 8,
};

const table: any = {
  background: "white",
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 6px 18px rgba(0,0,0,.08)",
};

const head: any = {
  display: "grid",
  gridTemplateColumns: "220px 1fr 120px 180px 160px",
  background: "#263f83",
  color: "white",
  fontWeight: 900,
};

const row: any = {
  display: "grid",
  gridTemplateColumns: "220px 1fr 120px 180px 160px",
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
  marginRight: 8,
  cursor: "pointer",
};

const activeBtn: any = {
  ...btn,
  background: "#16a34a",
};