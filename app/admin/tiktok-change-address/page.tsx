"use client";

import { useEffect, useState } from "react";
import Select from "react-select";

type Option = {
  value: string;
  label: string;
  raw?: any;
};

export default function TikTokChangeAddressPage() {
  const [sessions, setSessions] = useState("");
  const [mode, setMode] = useState<"create" | "existing">("create");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [addressId, setAddressId] = useState("");

  const [provinceOptions, setProvinceOptions] = useState<Option[]>([]);
  const [wardOptions, setWardOptions] = useState<Option[]>([]);
  const [province, setProvince] = useState<Option | null>(null);
  const [ward, setWard] = useState<Option | null>(null);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    loadProvinces();
  }, []);

  async function loadProvinces() {
    setLoadingProvinces(true);
    try {
      const res = await fetch("/api/address/provinces");
      const data = await res.json();

      setProvinceOptions(
        (data || []).map((p: any) => ({
          value: String(p.code || p.value),
          label: p.label || p.name,
          raw: p,
        }))
      );
    } catch {
      setProvinceOptions([]);
    } finally {
      setLoadingProvinces(false);
    }
  }

  async function loadWards(provinceCode: string) {
    setLoadingWards(true);
    setWard(null);
    setWardOptions([]);

    try {
      const res = await fetch(`/api/address/wards-by-province/${provinceCode}`);
      const data = await res.json();

      setWardOptions(
        (data || []).map((w: any) => ({
          value: String(w.code || w.value),
          label: w.label || w.name,
          raw: w,
        }))
      );
    } catch {
      setWardOptions([]);
    } finally {
      setLoadingWards(false);
    }
  }

  function getLines(text: string) {
    return text
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  async function runChangeAddress() {
    const sessionList = getLines(sessions);

    if (sessionList.length === 0) {
      alert("Chưa nhập Session TikTok");
      return;
    }

    if (
      mode === "create" &&
      (!name || !phone || !province || !ward || !detailAddress)
    ) {
      alert("Nhập đủ tên, số điện thoại, tỉnh/thành, phường/xã, địa chỉ chi tiết");
      return;
    }

    if (mode === "existing" && !addressId) {
      alert("Nhập new_address_id");
      return;
    }

    const fullAddress =
      mode === "create"
        ? `${detailAddress}, ${ward?.label}, ${province?.label}`
        : "";

    setLoading(true);
    setResults([]);

    for (let i = 0; i < sessionList.length; i++) {
      const payload =
        mode === "create"
          ? {
              cookie: sessionList[i],
              auto_create_address: true,
              name,
              phone,
              province: province?.label,
              district: "",
              ward: ward?.label,
              address: fullAddress,
              detail_address: detailAddress,
              province_code: province?.value,
              ward_code: ward?.value,
            }
          : {
              cookie: sessionList[i],
              auto_create_address: false,
              new_address_id: addressId,
            };

      try {
        const res = await fetch("/api/tiktok/change-address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        setResults((old) => [
          ...old,
          {
            stt: i + 1,
            success: data?.success ?? data?.data?.success,
            message:
              data?.message ||
              data?.error ||
              data?.data?.message ||
              data?.data?.error ||
              JSON.stringify(data?.data || data),
          },
        ]);
      } catch (err: any) {
        setResults((old) => [
          ...old,
          {
            stt: i + 1,
            success: false,
            message: err?.message || "Lỗi không xác định",
          },
        ]);
      }
    }

    setLoading(false);
  }

  const successCount = results.filter((x) => x.success).length;
  const failCount = results.filter((x) => !x.success).length;

  return (
    <main style={styles.page}>
      <AdminNav />

      <h1 style={styles.title}>📦 Đổi địa chỉ TikTok</h1>

      <section style={styles.box}>
        <h2>Session TikTok</h2>
        <textarea
          value={sessions}
          onChange={(e) => setSessions(e.target.value)}
          placeholder={`Dán session TikTok, mỗi dòng 1 session
session_1
session_2
session_3`}
          style={{ ...styles.input, height: 180 }}
        />
      </section>

      <section style={styles.box}>
        <h2>Thông tin địa chỉ mới</h2>

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as any)}
          style={styles.input}
        >
          <option value="create">Tự tạo địa chỉ mới</option>
          <option value="existing">Dùng new_address_id có sẵn</option>
        </select>

        {mode === "create" ? (
          <>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên người nhận"
              style={styles.input}
            />

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Số điện thoại"
              style={styles.input}
            />

            <div style={styles.selectWrap}>
              <label style={styles.label}>Tỉnh / Thành phố mới</label>
              <Select
                instanceId="province-select"
                options={provinceOptions}
                value={province}
                onChange={(option) => {
                  const selected = option as Option | null;
                  setProvince(selected);
                  setWard(null);
                  setWardOptions([]);

                  if (selected?.value) loadWards(selected.value);
                }}
                placeholder={
                  loadingProvinces ? "Đang tải tỉnh..." : "Chọn tỉnh / thành phố"
                }
                isLoading={loadingProvinces}
                isSearchable
                styles={selectStyles}
              />
            </div>

            <div style={styles.selectWrap}>
              <label style={styles.label}>Phường / Xã mới</label>
              <Select
                instanceId="ward-select"
                options={wardOptions}
                value={ward}
                onChange={(option) => setWard(option as Option | null)}
                placeholder={
                  !province
                    ? "Chọn tỉnh trước"
                    : loadingWards
                    ? "Đang tải phường/xã..."
                    : "Chọn phường / xã"
                }
                isDisabled={!province}
                isLoading={loadingWards}
                isSearchable
                styles={selectStyles}
              />
            </div>

            <textarea
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder="Địa chỉ chi tiết, ví dụ: 123 Lê Lợi, hẻm 10, gần trường..."
              style={{ ...styles.input, height: 100 }}
            />
          </>
        ) : (
          <input
            value={addressId}
            onChange={(e) => setAddressId(e.target.value)}
            placeholder="new_address_id"
            style={styles.input}
          />
        )}

        <button
          onClick={runChangeAddress}
          disabled={loading}
          style={{
            ...styles.mainBtn,
            opacity: loading ? 0.65 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Đang đổi..." : "Đổi địa chỉ"}
        </button>
      </section>

      <section style={styles.box}>
        <h2>Kết quả</h2>

        <div style={styles.stats}>
          <b>Tổng: {results.length}</b>
          <b style={{ color: "#22c55e" }}>Thành công: {successCount}</b>
          <b style={{ color: "#ef4444" }}>Lỗi: {failCount}</b>
        </div>

        <div style={styles.table}>
          <div style={styles.head}>
            <div>STT</div>
            <div>Trạng thái</div>
            <div>Message</div>
          </div>

          {results.map((r) => (
            <div key={r.stt} style={styles.row}>
              <div>{r.stt}</div>
              <div>{r.success ? "✅ Thành công" : "❌ Lỗi"}</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{r.message}</div>
            </div>
          ))}

          {results.length === 0 && (
            <div style={styles.empty}>Chưa có kết quả</div>
          )}
        </div>
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

      <a href="/admin" style={styles.navBtn}>
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

      <a href="/admin/tiktok-change-address" style={styles.activeBtn}>
        📦 Đổi địa chỉ TikTok
      </a>
    </div>
  );
}

const selectStyles: any = {
  control: (base: any) => ({
    ...base,
    background: "#1e293b",
    borderColor: "rgba(255,255,255,.15)",
    color: "white",
    minHeight: 46,
    borderRadius: 8,
    boxShadow: "none",
  }),
  menu: (base: any) => ({
    ...base,
    background: "#0f172a",
    color: "white",
    zIndex: 9999,
  }),
  option: (base: any, state: any) => ({
    ...base,
    background: state.isFocused ? "#2563eb" : "#0f172a",
    color: "white",
    cursor: "pointer",
  }),
  singleValue: (base: any) => ({ ...base, color: "white" }),
  input: (base: any) => ({ ...base, color: "white" }),
  placeholder: (base: any) => ({ ...base, color: "#94a3b8" }),
};

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
  title: { fontSize: 30, marginBottom: 20 },
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
    marginBottom: 14,
    border: "1px solid rgba(255,255,255,.15)",
    borderRadius: 8,
    background: "#1e293b",
    color: "white",
    outline: "none",
  },
  selectWrap: { marginTop: 10, marginBottom: 14 },
  label: {
    display: "block",
    marginBottom: 8,
    color: "#cbd5e1",
    fontWeight: 700,
  },
  mainBtn: {
    marginTop: 12,
    background: "#2563eb",
    color: "white",
    border: 0,
    padding: "12px 18px",
    borderRadius: 8,
    fontWeight: 800,
  },
  stats: {
    display: "flex",
    gap: 20,
    marginBottom: 15,
    flexWrap: "wrap",
  },
  table: {
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 10,
    overflow: "hidden",
  },
  head: {
    display: "grid",
    gridTemplateColumns: "70px 160px 1fr",
    background: "#1e40af",
    padding: 12,
    fontWeight: 900,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "70px 160px 1fr",
    padding: 12,
    borderTop: "1px solid rgba(255,255,255,.08)",
    alignItems: "center",
  },
  empty: {
    padding: 25,
    textAlign: "center",
    color: "#cbd5e1",
  },
};
