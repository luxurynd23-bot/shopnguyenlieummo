"use client";

import React, { useState } from "react";

interface DepositOption {
  amount: number;
  bonus: string;
}

const packages: DepositOption[] = [
  { amount: 100000, bonus: "0%" },
  { amount: 500000, bonus: "2%" },
  { amount: 1000000, bonus: "5%" },
];

export default function DepositPage() {
  const [selected, setSelected] = useState<DepositOption | null>(null);
  const [customAmount, setCustomAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  const bonus =
    packages
      .slice()
      .reverse()
      .find((pkg) => customAmount && Number(customAmount) >= pkg.amount)
      ?.bonus || selected?.bonus || "0%";

  const amount = Number(customAmount || selected?.amount || 0);

  function choosePackage(option: DepositOption) {
    setSelected(option);
    setCustomAmount("");
  }

  function closeModal() {
    setSelected(null);
    setCustomAmount("");
  }

  async function createPayment() {
    if (!amount || amount < 10000) {
      alert("Số tiền nạp tối thiểu là 10.000đ");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/payos/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.message || "Không tạo được thanh toán");
      }
    } catch {
      alert("Lỗi kết nối PayOS");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={page}>
      <a href="/" style={backBtn}>← Quay lại trang chủ</a>

      <section style={notice}>
        <ul>
          <li>Quét mã QR để tự động nhập nội dung CK. Nhập thủ công vui lòng nhập đúng nội dung.</li>
          <li>Nạp tối thiểu <b>10.000đ</b>, nạp dưới sẽ không được cộng.</li>
          <li>Số dư tự động cộng sau 1-10 phút. Nếu chưa cộng, liên hệ admin.</li>
          <li>Không hoàn tiền số dư đã nạp.</li>
        </ul>
      </section>

      <section style={promoBox}>
        <div style={promoHead}>
          <div>#</div>
          <div>Số tiền nạp lớn hơn hoặc bằng</div>
          <div>Khuyến mãi thêm</div>
        </div>

        <div style={promoRow}>
          <div>1</div>
          <div style={{ color: "#2563eb", fontWeight: 900 }}>1.000.000đ</div>
          <div style={{ color: "red", fontWeight: 900 }}>5%</div>
        </div>

        <div style={promoRow}>
          <div>2</div>
          <div style={{ color: "#2563eb", fontWeight: 900 }}>500.000đ</div>
          <div style={{ color: "red", fontWeight: 900 }}>2%</div>
        </div>
      </section>

      <section style={mainBox}>
        <h1 style={title}>Nạp tiền theo hoá đơn</h1>

        <div style={cardsContainer}>
          {packages.map((p) => (
            <div
              key={p.amount}
              style={{
                ...card,
                borderColor: selected?.amount === p.amount ? "#2563eb" : "#e5e7eb",
                background: selected?.amount === p.amount ? "#eff6ff" : "white",
              }}
              onClick={() => choosePackage(p)}
            >
              <div style={mbLogo}>MB</div>
              <h2>{p.amount.toLocaleString("vi-VN")}đ</h2>
              <p>
                Khuyến mãi: <b style={{ color: "red" }}>{p.bonus}</b>
              </p>
              <button style={selectBtn}>Chọn gói</button>
            </div>
          ))}

          <div
            style={{
              ...card,
              background: customAmount ? "#eff6ff" : "white",
              borderColor: customAmount ? "#2563eb" : "#e5e7eb",
            }}
          >
            <div style={mbLogo}>MB</div>
            <h2>Nhập số tiền</h2>

            <input
              type="number"
              placeholder="Ví dụ: 200000"
              min={10000}
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(Number(e.target.value));
                setSelected(null);
              }}
              style={customInput}
            />

            <p>
              Khuyến mãi: <b style={{ color: "red" }}>{bonus}</b>
            </p>

            <button
              style={selectBtn}
              onClick={() => {
                if (!customAmount || Number(customAmount) < 10000) {
                  alert("Nhập tối thiểu 10.000đ");
                  return;
                }
              }}
            >
              Chọn số tiền
            </button>
          </div>
        </div>
      </section>

      {(selected || customAmount) && (
        <div style={overlay} onClick={closeModal}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h2>Xác nhận nạp tiền</h2>

            <p>
              Số tiền: <b>{amount.toLocaleString("vi-VN")}đ</b>
            </p>

            <p>
              Khuyến mãi: <b style={{ color: "red" }}>{bonus}</b>
            </p>

            <div style={modalActions}>
              <button style={cancelBtn} onClick={closeModal}>
                Đóng
              </button>

              <button style={payBtn} onClick={createPayment} disabled={loading}>
                {loading ? "Đang tạo..." : "Tiến hành nạp"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const page: React.CSSProperties = {
  padding: 24,
  background: "#f3f6fb",
  minHeight: "100vh",
  fontFamily: "Arial",
};

const backBtn: React.CSSProperties = {
  display: "inline-block",
  background: "#ef4444",
  color: "white",
  padding: "10px 14px",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 900,
  marginBottom: 18,
};

const notice: React.CSSProperties = {
  background: "white",
  border: "2px solid #2563eb",
  borderRadius: 8,
  padding: "14px 24px",
  lineHeight: 1.6,
  marginBottom: 18,
};

const promoBox: React.CSSProperties = {
  background: "white",
  borderRadius: 8,
  overflow: "hidden",
  marginBottom: 26,
  boxShadow: "0 4px 14px rgba(0,0,0,.05)",
};

const promoHead: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "80px 1fr 1fr",
  background: "#d1fae5",
  border: "1px solid #93c5fd",
  fontWeight: 900,
  padding: "14px 0",
};

const promoRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "80px 1fr 1fr",
  borderLeft: "1px solid #cbd5e1",
  borderRight: "1px solid #cbd5e1",
  borderBottom: "1px solid #cbd5e1",
  padding: "14px 0",
};

const mainBox: React.CSSProperties = {
  background: "white",
  padding: 24,
  borderRadius: 12,
  boxShadow: "0 8px 22px rgba(0,0,0,.06)",
};

const title: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 900,
  marginTop: 0,
};

const cardsContainer: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 16,
};

const card: React.CSSProperties = {
  border: "2px solid #e5e7eb",
  borderRadius: 12,
  padding: 24,
  textAlign: "center",
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(0,0,0,.08)",
  transition: ".2s",
};

const mbLogo: React.CSSProperties = {
  width: 72,
  height: 72,
  margin: "0 auto 14px",
  borderRadius: 14,
  background: "#0050d7",
  color: "white",
  fontSize: 24,
  fontWeight: 900,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 8px 18px rgba(37,99,235,.28)",
};

const selectBtn: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: 0,
  borderRadius: 8,
  padding: "10px 16px",
  fontWeight: 900,
  cursor: "pointer",
  marginTop: 8,
};

const customInput: React.CSSProperties = {
  width: "100%",
  padding: 12,
  marginTop: 8,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  textAlign: "center",
};

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const modal: React.CSSProperties = {
  background: "white",
  width: 420,
  borderRadius: 14,
  padding: 28,
  textAlign: "center",
  boxShadow: "0 10px 30px rgba(0,0,0,.25)",
};

const modalActions: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 10,
  marginTop: 20,
};

const cancelBtn: React.CSSProperties = {
  background: "#64748b",
  color: "white",
  border: 0,
  borderRadius: 8,
  padding: "10px 16px",
  fontWeight: 900,
};

const payBtn: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: 0,
  borderRadius: 8,
  padding: "10px 16px",
  fontWeight: 900,
};