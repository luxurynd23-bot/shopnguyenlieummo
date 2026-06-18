"use client";

import { useState } from "react";

export default function CheckMvdPage() {
  const [session, setSession] = useState("");
  const [proxy, setProxy] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleCheck() {
    if (!session.trim()) {
      alert("Nhập cookie/session TikTok trước");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/tiktok/vubel/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session,
          proxy,
          count,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch {
      alert("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  }

  const details =
    result?.data?.data?.details ||
    result?.data?.details ||
    result?.data?.data?.orders ||
    result?.data?.orders ||
    result?.data?.items ||
    [];

  return (
    <main style={styles.page}>
      <div style={styles.box}>
        <a href="/" style={styles.backBtn}>← Về trang chủ</a>

        <h1 style={styles.title}>📦 Check Vận Đơn TikTok</h1>
        <p style={styles.desc}>
          Phí check: <b>500đ / cookie có đơn</b>. Cookie đã check lại sẽ không trừ tiền.
        </p>

        <label style={styles.label}>Cookie / Session TikTok</label>
        <textarea
          value={session}
          onChange={(e) => setSession(e.target.value)}
          placeholder="Dán cookie TikTok vào đây..."
          style={styles.textarea}
        />

        <label style={styles.label}>Proxy nếu có</label>
        <input
          value={proxy}
          onChange={(e) => setProxy(e.target.value)}
          placeholder="host:port:user:pass hoặc để trống dùng proxy mặc định"
          style={styles.input}
        />

        <label style={styles.label}>Số đơn cần lấy</label>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          min={1}
          max={20}
          style={styles.input}
        />

        <button onClick={handleCheck} disabled={loading} style={styles.btn}>
          {loading ? "Đang check..." : "Check ngay"}
        </button>

        {result && (
          <div style={styles.resultBox}>
            <h2>Kết quả</h2>

            <div style={styles.status}>
              Trạng thái:{" "}
              <b style={{ color: result.success ? "#22c55e" : "#ef4444" }}>
                {result.success ? "Thành công" : "Thất bại"}
              </b>
            </div>

            {result.message && <div style={styles.note}>{result.message}</div>}

            {result.charged !== undefined && (
              <div style={styles.note}>
                Trừ tiền: <b>{result.charged ? "Có" : "Không"}</b>
              </div>
            )}

            {details.length === 0 && (
              <div style={styles.empty}>Không có đơn hàng.</div>
            )}

            {details.map((item: any, index: number) => {
              const order = item?.order || {};
              const detail = item?.detail || {};
              const product =
                detail?.products?.[0] || order?.products?.[0] || {};

              return (
                <div key={index} style={styles.orderCard}>
                  <div style={styles.orderTitle}>
                    #{index + 1} - {detail?.status || order?.status || "Đơn hàng"}
                  </div>

                  <div style={styles.grid}>
                    <Info label="Mã đơn" value={detail?.orderId || order?.orderId} />
                    <Info label="Mã vận đơn" value={detail?.tracking} highlight />
                    <Info label="Shop" value={detail?.shop || order?.shop} />
                    <Info label="Tổng tiền" value={detail?.total || order?.total} />
                    <Info label="Đơn vị VC" value={detail?.carrierName} highlight />
                    <Info label="Shipper" value={detail?.shipperName} highlight />
                    <Info label="SĐT shipper" value={detail?.shipperPhone} highlight />
                    <Info label="SĐT khách" value={detail?.address?.phone} />
                    <Info label="Người nhận" value={detail?.address?.name} />
                    <Info label="Địa chỉ" value={detail?.address?.fullAddress} wide />
                    <Info label="Sản phẩm" value={product?.name} wide />
                    <Info label="Thanh toán" value={detail?.paymentMethod} />
                    <Info label="Ngày tạo" value={detail?.createdAt} />
                    <Info label="Ngày giao" value={detail?.deliveredAt} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function Info({
  label,
  value,
  highlight,
  wide,
}: {
  label: string;
  value?: any;
  highlight?: boolean;
  wide?: boolean;
}) {
  return (
    <div style={wide ? styles.infoWide : styles.info}>
      <div style={styles.infoLabel}>{label}</div>
      <div
        style={{
          ...styles.infoValue,
          color: highlight ? "#22c55e" : "white",
        }}
      >
        {value || "Không có"}
      </div>
    </div>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top right,rgba(236,72,153,.18),transparent 30%), radial-gradient(circle at top left,rgba(34,211,238,.14),transparent 30%), #090b10",
    color: "white",
    padding: 24,
    fontFamily: "Arial, sans-serif",
  },

  box: {
    maxWidth: 1100,
    margin: "0 auto",
    background: "rgba(15,23,42,.92)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 16,
    padding: 24,
  },

  backBtn: {
    color: "#22d3ee",
    textDecoration: "none",
    fontWeight: 900,
  },

  title: {
    fontSize: 32,
    marginTop: 20,
    marginBottom: 8,
  },

  desc: {
    color: "#cbd5e1",
    marginBottom: 20,
  },

  label: {
    display: "block",
    marginTop: 14,
    marginBottom: 8,
    fontWeight: 900,
  },

  textarea: {
    width: "100%",
    minHeight: 150,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.15)",
    background: "#020617",
    color: "white",
    padding: 14,
    outline: "none",
    resize: "vertical",
  },

  input: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.15)",
    background: "#020617",
    color: "white",
    padding: 14,
    outline: "none",
  },

  btn: {
    marginTop: 18,
    width: "100%",
    padding: 15,
    border: 0,
    borderRadius: 12,
    background: "linear-gradient(90deg,#06b6d4,#ec4899)",
    color: "white",
    fontWeight: 900,
    fontSize: 17,
    cursor: "pointer",
  },

  resultBox: {
    marginTop: 24,
    background: "#020617",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 14,
    padding: 20,
  },

  status: {
    marginBottom: 10,
  },

  note: {
    color: "#cbd5e1",
    marginBottom: 10,
  },

  empty: {
    padding: 20,
    textAlign: "center",
    color: "#cbd5e1",
  },

  orderCard: {
    marginTop: 18,
    background: "#111827",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 14,
    padding: 18,
  },

  orderTitle: {
    fontSize: 18,
    fontWeight: 900,
    color: "#22d3ee",
    marginBottom: 14,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: 12,
  },

  info: {
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 10,
    padding: 12,
  },

  infoWide: {
    gridColumn: "1 / -1",
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 10,
    padding: 12,
  },

  infoLabel: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 5,
    fontWeight: 800,
  },

  infoValue: {
    fontWeight: 900,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
};