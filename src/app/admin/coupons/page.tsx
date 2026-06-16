"use client";

import { useEffect, useState } from "react";

export default function AdminCouponsPage() {
const [coupons, setCoupons] = useState<any[]>([]);
const [code, setCode] = useState("");
const [type, setType] = useState("PERCENT");
const [value, setValue] = useState("");

async function loadCoupons() {
const res = await fetch("/api/admin-coupons");
const data = await res.json();
setCoupons(data.coupons || []);
}

async function createCoupon() {
if (!code || !value) {
alert("Nhập mã và giá trị");
return;
}

const res = await fetch("/api/admin-coupons", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    code,
    type,
    value,
  }),
});

const data = await res.json();
alert(data.message);

if (res.ok) {
  setCode("");
  setValue("");
  loadCoupons();
}

}

async function toggleCoupon(id: string, active: boolean) {
const res = await fetch("/api/admin-coupons", {
method: "PUT",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
id,
active: !active,
}),
});

const data = await res.json();
alert(data.message);

if (res.ok) {
  loadCoupons();
}

}

async function deleteCoupon(id: string) {
if (!confirm("Bạn chắc chắn muốn xóa coupon này?")) {
return;
}

const res = await fetch("/api/admin-coupons", {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id,
  }),
});

const data = await res.json();
alert(data.message);

if (res.ok) {
  loadCoupons();
}

}

useEffect(() => {
loadCoupons();
}, []);

return ( <main style={styles.page}> <div style={styles.header}> <div> <h1 style={styles.title}>🎟 Quản lý Coupon</h1> <p style={styles.subTitle}>
Tạo mã giảm giá theo phần trăm hoặc số tiền cố định. </p> </div>

    <a href="/admin/dashboard" style={styles.backBtn}>
      ← Dashboard
    </a>
  </div>

  <div style={styles.formBox}>
    <input
      value={code}
      onChange={(e) => setCode(e.target.value.toUpperCase())}
      placeholder="Mã coupon VD: SALE10"
      style={styles.input}
    />

    <select
      value={type}
      onChange={(e) => setType(e.target.value)}
      style={styles.input}
    >
      <option value="PERCENT">Giảm theo %</option>
      <option value="FIXED">Giảm tiền cố định</option>
    </select>

    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Giá trị"
      type="number"
      style={styles.input}
    />

    <button onClick={createCoupon} style={styles.createBtn}>
      + Tạo coupon
    </button>
  </div>

  <div style={styles.listBox}>
    <h2 style={styles.boxTitle}>Danh sách coupon</h2>

    {coupons.length === 0 && (
      <div style={styles.empty}>Chưa có coupon nào.</div>
    )}

    {coupons.map((c) => (
      <div key={c.id} style={styles.row}>
        <div>
          <div style={styles.code}>{c.code}</div>

          <div style={styles.desc}>
            {c.type === "PERCENT"
              ? `Giảm ${c.value}%`
              : `Giảm ${Number(c.value).toLocaleString("vi-VN")}đ`}
          </div>
        </div>

        <div style={styles.right}>
          <span
            style={{
              ...styles.status,
              background: c.active ? "#16a34a" : "#dc2626",
            }}
          >
            {c.active ? "Đang bật" : "Đã tắt"}
          </span>

          <button
            onClick={() => toggleCoupon(c.id, c.active)}
            style={styles.toggleBtn}
          >
            {c.active ? "Tắt" : "Bật"}
          </button>

          <button
            onClick={() => deleteCoupon(c.id)}
            style={styles.deleteBtn}
          >
            Xóa
          </button>
        </div>
      </div>
    ))}
  </div>
</main>

);
}

const styles: any = {
page: {
minHeight: "100vh",
background:
"radial-gradient(circle at top right,rgba(236,72,153,.16),transparent 30%), radial-gradient(circle at top left,rgba(34,211,238,.14),transparent 28%), #0f172a",
color: "white",
padding: 30,
fontFamily: "Arial, sans-serif",
},

header: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
marginBottom: 24,
},

title: {
fontSize: 34,
fontWeight: 900,
margin: 0,
},

subTitle: {
color: "#cbd5e1",
fontWeight: 700,
marginTop: 8,
},

backBtn: {
color: "white",
textDecoration: "none",
background: "linear-gradient(90deg,#06b6d4,#ec4899)",
padding: "12px 16px",
borderRadius: 10,
fontWeight: 900,
},

formBox: {
display: "grid",
gridTemplateColumns: "1fr 220px 180px 160px",
gap: 12,
background: "#111827",
padding: 20,
borderRadius: 14,
border: "1px solid rgba(255,255,255,.12)",
marginBottom: 24,
},

input: {
padding: 13,
borderRadius: 8,
border: "1px solid rgba(255,255,255,.15)",
outline: "none",
},

createBtn: {
background: "#22c55e",
color: "white",
border: 0,
borderRadius: 8,
fontWeight: 900,
cursor: "pointer",
},

listBox: {
background: "#111827",
padding: 20,
borderRadius: 14,
border: "1px solid rgba(255,255,255,.12)",
},

boxTitle: {
marginTop: 0,
fontWeight: 900,
},

row: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
padding: "14px 0",
borderBottom: "1px solid rgba(255,255,255,.08)",
},

code: {
fontSize: 20,
fontWeight: 900,
color: "#22d3ee",
},

desc: {
color: "#cbd5e1",
marginTop: 4,
},

right: {
display: "flex",
alignItems: "center",
gap: 10,
},

status: {
padding: "7px 10px",
borderRadius: 999,
fontSize: 13,
fontWeight: 900,
color: "white",
},

toggleBtn: {
background: "#2563eb",
color: "white",
border: 0,
borderRadius: 8,
padding: "9px 13px",
fontWeight: 900,
cursor: "pointer",
},

deleteBtn: {
background: "#dc2626",
color: "white",
border: 0,
borderRadius: 8,
padding: "9px 13px",
fontWeight: 900,
cursor: "pointer",
},

empty: {
color: "#cbd5e1",
padding: 20,
},
};
