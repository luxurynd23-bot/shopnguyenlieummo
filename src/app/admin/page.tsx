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
      stock: String(p.stock),
      content: p.content || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
if (checking) {
  return <main style={{ padding: 30 }}>Đang kiểm tra quyền...</main>;
}

if (!user || user.role !== "ADMIN") {
  return (
    <main style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>Không có quyền truy cập</h1>
      <p>Chỉ ADMIN mới được vào trang này.</p>
      <a href="/">← Về trang chủ</a>
    </main>
  );
}
  return (
    <main
      style={{
        padding: 30,
        fontFamily: "Arial",
        background: "#f3f6fb",
        minHeight: "100vh",
      }}
    >
      <h1>Admin quản lý sản phẩm</h1>

      <div style={{ marginBottom: 20 }}>
        <a href="/">← Về trang chủ</a>
      </div>

      <section style={boxStyle}>
        <h2>{form.id ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>

        <input
          placeholder="Tên sản phẩm"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={inputStyle}
        />

        <input
          placeholder="Giá"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          style={inputStyle}
        />

        <input
          placeholder="Tồn kho hiển thị ban đầu"
          type="number"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          style={inputStyle}
        />

        <textarea
          placeholder="Ghi chú sản phẩm"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          style={{ ...inputStyle, height: 90 }}
        />

        <button onClick={saveProduct} style={buttonStyle}>
          {form.id ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
        </button>

        {form.id && (
          <button
            onClick={resetForm}
            style={{
              ...buttonStyle,
              background: "#64748b",
              marginLeft: 10,
            }}
          >
            Hủy sửa
          </button>
        )}
      </section>

      <section style={boxStyle}>
        <h2>Nhập kho tài khoản tự động</h2>

        <select
          value={stockForm.productId}
          onChange={(e) =>
            setStockForm({ ...stockForm, productId: e.target.value })
          }
          style={inputStyle}
        >
          <option value="">-- Chọn sản phẩm --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} - giá {p.price.toLocaleString("vi-VN")}đ
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
          style={{ ...inputStyle, height: 170 }}
        />

        <button onClick={importStock} style={buttonStyle}>
          Nhập kho
        </button>
      </section>

      <section
        style={{
          background: "white",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 4px 14px rgba(0,0,0,.08)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 120px 220px",
            background: "#263f83",
            color: "white",
            fontWeight: 900,
          }}
        >
          <div style={cellStyle}>Sản phẩm</div>
          <div style={cellStyle}>Giá</div>
          <div style={cellStyle}>Kho</div>
          <div style={cellStyle}>Thao tác</div>
        </div>

        {products.map((p) => (
          <div
            key={p.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 120px 220px",
              borderTop: "1px solid #ddd",
              alignItems: "center",
            }}
          >
            <div style={cellStyle}>
              <b>{p.name}</b>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
                {p.content}
              </pre>
            </div>

            <div style={cellStyle}>{p.price.toLocaleString("vi-VN")}đ</div>

            <div style={cellStyle}>
              <b>{p.unsold}</b> chưa bán
              <br />
              <span style={{ color: "#16a34a" }}>{p.sold} đã bán</span>
              <br />
              <span style={{ color: "#64748b" }}>Tổng: {p.total}</span>
            </div>

            <div style={cellStyle}>
              <button onClick={() => editProduct(p)} style={smallButton}>
                Sửa
              </button>

              <button
                onClick={() => deleteProduct(p.id)}
                style={{
                  ...smallButton,
                  background: "#dc2626",
                  marginLeft: 8,
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

const boxStyle: any = {
  background: "white",
  padding: 20,
  borderRadius: 10,
  marginBottom: 25,
  boxShadow: "0 4px 14px rgba(0,0,0,.08)",
};

const inputStyle: any = {
  display: "block",
  width: "100%",
  padding: 12,
  marginTop: 10,
  border: "1px solid #cbd5e1",
  borderRadius: 8,
};

const buttonStyle: any = {
  marginTop: 12,
  background: "#2563eb",
  color: "white",
  border: 0,
  padding: "12px 18px",
  borderRadius: 8,
  fontWeight: 800,
  cursor: "pointer",
};

const smallButton: any = {
  background: "#2563eb",
  color: "white",
  border: 0,
  padding: "8px 12px",
  borderRadius: 6,
  fontWeight: 800,
  cursor: "pointer",
};

const cellStyle: any = {
  padding: 14,
};