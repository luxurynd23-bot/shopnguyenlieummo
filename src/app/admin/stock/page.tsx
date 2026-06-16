"use client";

import { useEffect, useState } from "react";

export default function AdminStockPage() {
const [items, setItems] = useState<any[]>([]);
const [products, setProducts] = useState<any[]>([]);
const [filter, setFilter] = useState("ALL");
const [keyword, setKeyword] = useState("");

const [productId, setProductId] = useState("");
const [importText, setImportText] = useState("");
const [importing, setImporting] = useState(false);

async function loadItems() {
const res = await fetch("/api/admin-stock-items");
const data = await res.json();
setItems(data.items || []);
}

async function loadProducts() {
const res = await fetch("/api/admin-products");
const data = await res.json();
setProducts(data.products || []);

if (!productId && data.products?.length > 0) {
  setProductId(data.products[0].id);
}

}

useEffect(() => {
loadItems();
loadProducts();
}, []);

async function importAccounts() {
if (!productId) {
alert("Vui lòng chọn sản phẩm");
return;
}

if (!importText.trim()) {
  alert("Vui lòng dán danh sách tài khoản");
  return;
}

setImporting(true);

try {
  const res = await fetch("/api/admin-stock", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId,
      content: importText,
    }),
  });

  const data = await res.json();
  alert(data.message || "Đã nhập kho");

  if (res.ok) {
    setImportText("");
    loadItems();
    loadProducts();
  }
} catch {
  alert("Lỗi nhập kho");
} finally {
  setImporting(false);
}

}

async function deleteItem(id: string) {
if (!confirm("Xóa tài khoản này khỏi kho?")) return;

const res = await fetch("/api/admin-stock-items", {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ id }),
});

if (res.ok) {
  alert("Đã xóa");
  loadItems();
  loadProducts();
} else {
  alert("Lỗi xóa");
}

}

const validLines = importText
.split("\n")
.map((x) => x.trim())
.filter(Boolean);

const filtered = items.filter((i) => {
const matchStatus =
filter === "ALL" ||
(filter === "SOLD" && i.sold) ||
(filter === "UNSOLD" && !i.sold);

const matchKeyword =
  (i.productName || "").toLowerCase().includes(keyword.toLowerCase()) ||
  (i.content || "").toLowerCase().includes(keyword.toLowerCase());

return matchStatus && matchKeyword;

});

return ( <main style={styles.page}> <AdminNav />

  <div style={styles.headerBox}>
  <h1 style={styles.title}>📦 Quản lý kho tài khoản</h1>

  <div style={{ display: "flex", gap: 10 }}>
    <a
      href="/api/admin-stock/export"
      target="_blank"
      style={styles.exportBtn}
    >
      📤 Export TXT
    </a>

    <button onClick={loadItems} style={styles.reloadBtn}>
      ↻ Tải lại
    </button>
  </div>
</div>

  <section style={styles.importBox}>
    <h2 style={styles.boxTitle}>📥 Nhập kho hàng loạt</h2>

    <div style={styles.importGrid}>
      <select
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        style={styles.input}
      >
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} - {Number(p.price || 0).toLocaleString("vi-VN")}đ
          </option>
        ))}
      </select>

      <button
        onClick={importAccounts}
        disabled={importing}
        style={styles.importBtn}
      >
        {importing ? "Đang nhập..." : `Nhập ${validLines.length} dòng`}
      </button>
    </div>
<input
  type="file"
  accept=".txt"
  style={styles.fileInput}
  onChange={async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const text = await file.text();
    setImportText(text);
  }}
/>
    <textarea
      value={importText}
      onChange={(e) => setImportText(e.target.value)}
      placeholder={"Dán mỗi tài khoản 1 dòng\nuser1|pass1|mail1\nuser2|pass2|mail2"}
      style={styles.textarea}
    />

    <div style={styles.hint}>
      Số dòng hợp lệ: <b>{validLines.length}</b>
    </div>
  </section>

  <section style={styles.box}>
    <input
      placeholder="Tìm sản phẩm hoặc tài khoản..."
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
      style={styles.input}
    />

    <div style={styles.filterRow}>
      <button
        onClick={() => setFilter("ALL")}
        style={filter === "ALL" ? styles.filterActiveBtn : styles.btn}
      >
        Tất cả
      </button>

      <button
        onClick={() => setFilter("UNSOLD")}
        style={filter === "UNSOLD" ? styles.filterActiveBtn : styles.btn}
      >
        Chưa bán
      </button>

      <button
        onClick={() => setFilter("SOLD")}
        style={filter === "SOLD" ? styles.filterActiveBtn : styles.btn}
      >
        Đã bán
      </button>
    </div>

    <p>
      Tổng hiển thị: <b>{filtered.length}</b>
    </p>
  </section>

  <div style={styles.tableBox}>
    <div style={styles.head}>
      <div style={styles.cell}>Sản phẩm</div>
      <div style={styles.cell}>Tài khoản</div>
      <div style={styles.cell}>Trạng thái</div>
      <div style={styles.cell}>Ngày nhập</div>
      <div style={styles.cell}>Thao tác</div>
    </div>

    {filtered.map((i) => (
      <div key={i.id} style={styles.row}>
        <div style={styles.cell}>
          <b>{i.productName}</b>
        </div>

        <pre style={styles.preCell}>{i.content}</pre>

        <div style={styles.cell}>
          {i.sold ? (
            <span style={{ color: "#ef4444", fontWeight: 900 }}>
              Đã bán
            </span>
          ) : (
            <span style={{ color: "#22c55e", fontWeight: 900 }}>
              Chưa bán
            </span>
          )}
        </div>

        <div style={styles.cell}>
          {new Date(i.createdAt).toLocaleString("vi-VN")}
        </div>

        <div style={styles.cell}>
          <button
            style={styles.btn}
            onClick={() => navigator.clipboard.writeText(i.content || "")}
          >
            Copy
          </button>

          {!i.sold && (
            <button
              style={styles.deleteBtn}
              onClick={() => deleteItem(i.id)}
            >
              Xóa
            </button>
          )}
        </div>
      </div>
    ))}

    {filtered.length === 0 && (
      <div style={styles.empty}>Chưa có tài khoản trong kho</div>
    )}
  </div>
</main>

);
}

function AdminNav() {
return ( <div style={styles.nav}> <a href="/" style={styles.homeBtn}>
← Trang chủ </a>

  <a href="/admin/dashboard" style={styles.navBtn}>
    📊 Dashboard
  </a>

  <a href="/admin" style={styles.navBtn}>
    📦 Sản phẩm
  </a>

  <a href="/admin/stock" style={styles.activeBtn}>
    📥 Kho
  </a>

  <a href="/admin/orders" style={styles.navBtn}>
    📋 Đơn hàng
  </a>

  <a href="/admin/users" style={styles.navBtn}>
    👤 Users
  </a>

  <a href="/admin/coupons" style={styles.navBtn}>
    🎟 Coupon
  </a>

  <a href="/admin/settings" style={styles.navBtn}>
    ⚙️ Cài đặt
  </a>
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
exportBtn: {
  background: "#22c55e",
  color: "white",
  textDecoration: "none",
  padding: "10px 14px",
  borderRadius: 8,
  fontWeight: 800,
},
nav: {
display: "flex",
gap: 10,
flexWrap: "wrap",
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
},

activeBtn: {
background: "#2563eb",
color: "white",
textDecoration: "none",
padding: "10px 14px",
borderRadius: 8,
fontWeight: 900,
},

headerBox: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
marginBottom: 20,
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

importBox: {
background:
"linear-gradient(135deg,rgba(34,211,238,.08),rgba(236,72,153,.08))",
padding: 18,
borderRadius: 12,
marginBottom: 18,
border: "1px solid rgba(255,255,255,.12)",
},

importGrid: {
display: "grid",
gridTemplateColumns: "1fr 180px",
gap: 12,
marginBottom: 12,
},

boxTitle: {
marginTop: 0,
fontWeight: 900,
},

box: {
background: "#111827",
padding: 18,
borderRadius: 12,
marginBottom: 18,
border: "1px solid rgba(255,255,255,.12)",
},

input: {
width: "100%",
padding: 12,
borderRadius: 8,
border: "1px solid rgba(255,255,255,.15)",
background: "#1e293b",
color: "white",
outline: "none",
},

textarea: {
width: "100%",
minHeight: 160,
padding: 12,
borderRadius: 8,
border: "1px solid rgba(255,255,255,.15)",
background: "#020617",
color: "white",
outline: "none",
resize: "vertical",
},

importBtn: {
background: "#22c55e",
color: "white",
border: 0,
borderRadius: 8,
fontWeight: 900,
cursor: "pointer",
},

hint: {
marginTop: 10,
color: "#cbd5e1",
},

filterRow: {
marginTop: 12,
marginBottom: 12,
display: "flex",
gap: 8,
},

tableBox: {
background: "#111827",
borderRadius: 12,
overflow: "auto",
border: "1px solid rgba(255,255,255,.12)",
},

head: {
display: "grid",
gridTemplateColumns: "220px 1fr 120px 180px 160px",
background: "#1e40af",
color: "white",
fontWeight: 900,
},

row: {
display: "grid",
gridTemplateColumns: "220px 1fr 120px 180px 160px",
borderTop: "1px solid rgba(255,255,255,.08)",
alignItems: "center",
},

cell: {
padding: 12,
fontSize: 14,
},

preCell: {
padding: 12,
fontSize: 14,
whiteSpace: "pre-wrap",
margin: 0,
color: "#e5e7eb",
},

btn: {
background: "#2563eb",
color: "white",
border: 0,
padding: "8px 10px",
borderRadius: 6,
fontWeight: 800,
cursor: "pointer",
marginRight: 6,
},

filterActiveBtn: {
background: "#16a34a",
color: "white",
border: 0,
padding: "8px 10px",
borderRadius: 6,
fontWeight: 800,
cursor: "pointer",
marginRight: 6,
},

deleteBtn: {
background: "#dc2626",
color: "white",
border: 0,
padding: "8px 10px",
borderRadius: 6,
fontWeight: 800,
cursor: "pointer",
},
fileInput: {
  width: "100%",
  marginBottom: 12,
  padding: 12,
  borderRadius: 8,
  background: "#020617",
  color: "white",
  border: "1px solid rgba(255,255,255,.15)",
},
empty: {
padding: 30,
textAlign: "center",
color: "#cbd5e1",
},
};
