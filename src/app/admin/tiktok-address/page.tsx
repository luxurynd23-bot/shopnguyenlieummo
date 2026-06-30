"use client";

import { useState } from "react";

export default function TiktokAddressPage() {
  const [mode, setMode] = useState<"CREATE_ADDRESS" | "ADDRESS_ID">("CREATE_ADDRESS");
  const [cookie, setCookie] = useState("");
  const [orderId, setOrderId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [newAddressId, setNewAddressId] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);

    const res = await fetch("/api/tiktok/address-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cookie,
        orderId,
        mode,
        name,
        phone,
        address,
        newAddressId,
      }),
    });

    const data = await res.json();
    alert(data.message || "Xong");
    setLoading(false);
  }

  return (
    <main style={styles.page}>
      <a href="/" style={styles.back}>← Về trang chủ</a>
      <h1>🏠 Đổi địa chỉ TikTok</h1>

      <div style={styles.box}>
        <label style={styles.label}>Chế độ</label>
        <select value={mode} onChange={(e) => setMode(e.target.value as any)} style={styles.input}>
          <option value="CREATE_ADDRESS">Tạo địa chỉ mới rồi đổi</option>
          <option value="ADDRESS_ID">Đổi sang Address ID đã lưu</option>
        </select>

        <label style={styles.label}>Cookie TikTok</label>
        <textarea value={cookie} onChange={(e) => setCookie(e.target.value)} style={styles.textarea} />

        <label style={styles.label}>Order ID</label>
        <input value={orderId} onChange={(e) => setOrderId(e.target.value)} style={styles.input} />

        {mode === "CREATE_ADDRESS" ? (
          <>
            <label style={styles.label}>Tên người nhận</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />

            <label style={styles.label}>SĐT</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} style={styles.input} />

            <label style={styles.label}>Địa chỉ</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} style={styles.textarea} />
          </>
        ) : (
          <>
            <label style={styles.label}>Address ID</label>
            <input value={newAddressId} onChange={(e) => setNewAddressId(e.target.value)} style={styles.input} />
          </>
        )}

        <button onClick={submit} disabled={loading} style={styles.btn}>
          {loading ? "Đang gửi..." : "Tạo yêu cầu đổi địa chỉ"}
        </button>
      </div>
    </main>
  );
}

const styles: any = {
  page: { minHeight: "100vh", background: "#0f172a", color: "white", padding: 24, fontFamily: "Arial" },
  back: { color: "#22d3ee", textDecoration: "none", fontWeight: 900 },
  box: { maxWidth: 800, background: "#020617", border: "1px solid #334155", borderRadius: 12, padding: 20, marginTop: 20 },
  label: { display: "block", marginTop: 14, marginBottom: 8, fontWeight: 900 },
  input: { width: "100%", padding: 13, borderRadius: 8, background: "#0f172a", color: "white", border: "1px solid #334155" },
  textarea: { width: "100%", minHeight: 110, padding: 13, borderRadius: 8, background: "#0f172a", color: "white", border: "1px solid #334155" },
  btn: { marginTop: 18, width: "100%", padding: 14, border: 0, borderRadius: 8, background: "#ec4899", color: "white", fontWeight: 900 },
};