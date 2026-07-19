"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  const [form, setForm] = useState({
    id: "",
    name: "",
    price: "",
    stock: "",
    content: "",
  });

  const [stockForm, setStockForm] = useState({
    productId: "",
    content: "",
  });

  async function loadProducts() {
    const res = await fetch("/api/admin-stock-list");
    const data = await res.json();
    setProducts(data.products || []);
  }

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setChecking(false);

        if (data.user?.role === "ADMIN") {
          loadProducts();
        }
      })
      .catch(() => {
        setUser(null);
        setChecking(false);
      });
  }, []);

  function resetForm() {
    setForm({
      id: "",
      name: "",
      price: "",
      stock: "",
      content: "",
    });
  }

  async function saveProduct() {
    if (!form.name || !form.price) {
      alert("Nhập tên và giá sản phẩm");
      return;
    }

    const method = form.id ? "PUT" : "POST";

    const res = await fetch("/api/admin-products", {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert(form.id ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm");
      resetForm();
      loadProducts();
    } else {
      alert("Lỗi lưu sản phẩm");
    }
  }

  async function importStock() {
    if (!stockForm.productId || !stockForm.content.trim()) {
      alert("Chọn sản phẩm và dán danh sách tài khoản");
      return;
    }

    const res = await fetch("/api/admin-stock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stockForm),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Đã nhập kho " + data.count + " tài khoản");
      setStockForm({
        productId: "",
        content: "",
      });
      loadProducts();
    } else {
      alert(data.message || "Lỗi nhập kho");
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    const res = await fetch("/api/admin-products", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      alert("Đã xóa sản phẩm");
      loadProducts();
    } else {
      alert("Lỗi xóa sản phẩm");
    }
  }

  function editProduct(p: any) {
    setForm({
      id: p.id,
      name: p.name,
      price: String(p.price),
      stock: String(p.stock || ""),
      content: p.content || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (checking) {
    return (
      <main style={styles.page}>
        <AdminNav />
        <p>Đang kiểm tra quyền...</p>
      </main>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <main style={styles.page}>
        <AdminNav />
        <h1>Không có quyền truy cập</h1>
        <p>Chỉ ADMIN mới được vào trang này.</p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <AdminNav />

      <div style={styles.headerBox}>
        <h1 style={styles.title}>📦 Admin quản lý sản phẩm</h1>

        <button onClick={loadProducts} style={styles.reloadBtn}>
          ↻ Tải lại
        </button>
      </div>

      <section style={styles.box}>
        <h2>{form.id ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>

        <input
          placeholder="Tên sản phẩm"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={styles.input}
        />

        <input
          placeholder="Giá"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          style={styles.input}
        />

        <input
          placeholder="Tồn kho hiển thị ban đầu"
          type="number"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          style={styles.input}
        />

        <textarea
          placeholder="Ghi chú sản phẩm"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          style={{ ...styles.input, height: 90 }}
        />

        <button onClick={saveProduct} style={styles.mainBtn}>
          {form.id ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
        </button>

        {form.id && (
          <button onClick={resetForm} style={styles.cancelBtn}>
            Hủy sửa
          </button>
        )}
      </section>

      <section style={styles.box}>
        <h2>Nhập kho tài khoản tự động</h2>

        <select
          value={stockForm.productId}
          onChange={(e) =>
            setStockForm({ ...stockForm, productId: e.target.value })
          }
          style={styles.input}
        >
          <option value="">-- Chọn sản phẩm --</option>

          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} - giá {Number(p.price || 0).toLocaleString("vi-VN")}đ
            </option>
          ))}
        </select>

        <textarea
          placeholder={`Dán mỗi tài khoản 1 dòng, ví dụ:
user1|pass1|email|passmail|oauth2
user2|pass2|email|passmail|oauth2
user3|pass3|email|passmail|oauth2`}
          value={stockForm.content}
          onChange={(e) =>
            setStockForm({ ...stockForm, content: e.target.value })
          }
          style={{ ...styles.input, height: 170 }}
        />

        <button onClick={importStock} style={styles.mainBtn}>
          Nhập kho
        </button>
      </section>

      <section style={styles.tableBox}>
        <div style={styles.head}>
          <div style={styles.cell}>Sản phẩm</div>
          <div style={styles.cell}>Giá</div>
          <div style={styles.cell}>Kho</div>
          <div style={styles.cell}>Thao tác</div>
        </div>

        {products.map((p) => (
          <div key={p.id} style={styles.row}>
            <div style={styles.cell}>
              <b>{p.name}</b>

              <pre style={styles.pre}>{p.content}</pre>
            </div>

            <div style={styles.cell}>
              {Number(p.price || 0).toLocaleString("vi-VN")}đ
            </div>

            <div style={styles.cell}>
              <b>{p.unsold}</b> chưa bán
              <br />
              <span style={{ color: "#22c55e" }}>{p.sold} đã bán</span>
              <br />
              <span style={{ color: "#94a3b8" }}>Tổng: {p.total}</span>
            </div>

            <div style={styles.cell}>
              <button onClick={() => editProduct(p)} style={styles.smallBtn}>
                Sửa
              </button>

              <button
                onClick={() => deleteProduct(p.id)}
                style={styles.deleteBtn}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div style={styles.empty}>Chưa có sản phẩm</div>
        )}
      </section>
    </main>
  );
}

function AdminNav() {
  return (
    <div style={styles.nav}>
      <a href="/" style={styles.homeBtn}>
        ← Trang chủ
      </a>

      <a href="/admin/dashboard" style={styles.navBtn}>
        📊 Dashboard
      </a>

      <a href="/admin" style={styles.activeBtn}>
        📦 Sản phẩm
      </a>

      <a href="/admin/stock" style={styles.navBtn}>
        📥 Kho
      </a>

      <a href="/admin/orders" style={styles.navBtn}>
        📋 Đơn hàng
      </a>

      <a href="/admin/users" style={styles.navBtn}>
        👤 Users
      </a>

      <a href="/admin/settings" style={styles.navBtn}>
        ⚙️ Cài đặt
      </a>
      <a href="/admin/tiktok-change-address" style={styles.navBtn}>
  📦 Đổi địa chỉ TikTok
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

  box: {
    background: "#111827",
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    border: "1px solid rgba(255,255,255,.12)",
  },

  input: {
    display: "block",
    width: "100%",
    padding: 12,
    marginTop: 10,
    border: "1px solid rgba(255,255,255,.15)",
    borderRadius: 8,
    background: "#1e293b",
    color: "white",
    outline: "none",
  },

  mainBtn: {
    marginTop: 12,
    background: "#2563eb",
    color: "white",
    border: 0,
    padding: "12px 18px",
    borderRadius: 8,
    fontWeight: 800,
    cursor: "pointer",
  },

  cancelBtn: {
    marginTop: 12,
    marginLeft: 10,
    background: "#64748b",
    color: "white",
    border: 0,
    padding: "12px 18px",
    borderRadius: 8,
    fontWeight: 800,
    cursor: "pointer",
  },

  tableBox: {
    background: "#111827",
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,.12)",
  },

  head: {
    display: "grid",
    gridTemplateColumns: "1fr 120px 160px 220px",
    background: "#1e40af",
    color: "white",
    fontWeight: 900,
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 120px 160px 220px",
    borderTop: "1px solid rgba(255,255,255,.08)",
    alignItems: "center",
  },

  cell: {
    padding: 14,
  },

  pre: {
    whiteSpace: "pre-wrap",
    fontSize: 12,
    color: "#cbd5e1",
    margin: "8px 0 0",
  },

  smallBtn: {
    background: "#2563eb",
    color: "white",
    border: 0,
    padding: "8px 12px",
    borderRadius: 6,
    fontWeight: 800,
    cursor: "pointer",
  },

  deleteBtn: {
    background: "#dc2626",
    color: "white",
    border: 0,
    padding: "8px 12px",
    borderRadius: 6,
    fontWeight: 800,
    cursor: "pointer",
    marginLeft: 8,
  },

  empty: {
    padding: 30,
    textAlign: "center",
    color: "#cbd5e1",
  },
};