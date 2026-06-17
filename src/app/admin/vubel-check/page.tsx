"use client";

import { useState } from "react";

type Row = {
  session: string;
  proxy: string;
  account?: string;
  note?: string;
  orderId?: string;
  orderTime?: string;
  shopName?: string;
  product?: string;
  total?: string;
  status?: string;
  trackingNo?: string;
  shipper?: string;
  shipperPhone?: string;
  phone?: string;
  address?: string;
  detail?: any;
  checking?: boolean;
  raw?: any;
};

export default function VubelCheckPage() {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [checkingAll, setCheckingAll] = useState(false);

  function parseRows() {
    const list = input
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|");
        return {
          session: parts[0] || line,
          proxy: "",
          note: "Chưa check",
          status: "Chờ check",
        };
      });

    setRows(list);
  }

  async function checkOne(index: number) {
    const row = rows[index];
if (
  row.trackingNo &&
  !confirm(
    "Session này đã có kết quả. Check lại sẽ bị trừ tiền. Tiếp tục?"
  )
) {
  return;
}
    if (!row.session) return;

    const newRows = [...rows];
    newRows[index] = {
      ...newRows[index],
      checking: true,
      status: "Đang check",
      note: "",
    };
    setRows(newRows);

    try {
      const res = await fetch("/api/tiktok/vubel/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  session: row.session,
  count: 5,
}),
      });

      const data = await res.json();

console.log("========== VUBEL ==========");
console.log(JSON.stringify(data, null, 2));
console.log("===========================");

      const body = data?.data || data;

const details =
  body?.data?.details ||
  body?.details ||
  body?.data?.orders ||
  body?.orders ||
  body?.items ||
  [];

const firstOrder = Array.isArray(details) ? details[0] : null;

const order = firstOrder?.order || {};
const detail = firstOrder?.detail || {};
const product = detail?.products?.[0] || order?.products?.[0] || {};

      if (!data.success || !body?.ok) {
        newRows[index] = {
          ...row,
          checking: false,
          status: "Lỗi",
          note: body?.message || body?.error || data?.message || "Check lỗi",
          raw: data,
        };
      } else if (!firstOrder) {
        newRows[index] = {
          ...row,
          checking: false,
          status: "Hoạt động",
          note: "Không có đơn hàng",
          raw: data,
        };
      } else {
  newRows[index] = {
  ...row,
  checking: false,
  account: detail?.address?.name || "",
  note: detail?.shippingNote || order?.note || "Có đơn hàng",
  orderId: detail?.orderId || order?.orderId || "",
  orderTime: detail?.createdAt || "",
  shopName: detail?.shop || order?.shop || "",
  product: product?.name || "",
  total: detail?.total || order?.total || "",
  status: detail?.status || order?.status || "Có đơn hàng",
  trackingNo: detail?.tracking || "",
  shipper: detail?.shippingState || "",
  shipperPhone:
  detail?.shipperPhone ||
  detail?.shipper_phone ||
  detail?.carrierPhone ||
  detail?.carrier_phone ||
  detail?.driverPhone ||
  detail?.driver_phone ||
  "",
  phone: detail?.address?.phone || "",
  address: detail?.address?.fullAddress || "",
  detail,
  raw: data,
};
}

      setRows([...newRows]);
    } catch (err) {
      const newRows2 = [...rows];
      newRows2[index] = {
        ...row,
        checking: false,
        status: "Lỗi",
        note: String(err),
      };
      setRows(newRows2);
    }
  }

  async function checkAll() {
    setCheckingAll(true);

    for (let i = 0; i < rows.length; i++) {
  if (rows[i].trackingNo || rows[i].detail || rows[i].status === "Lỗi") {
    continue;
  }

  await checkOne(i);
  await new Promise((r) => setTimeout(r, 600));
}

    setCheckingAll(false);
  }

  function exportTxt() {
    const text = rows
      .map((r) =>
        [
          r.session,
          r.account || "",
          r.note || "",
          r.orderId || "",
          r.orderTime || "",
          r.shopName || "",
          r.product || "",
          r.total || "",
          r.status || "",
          r.trackingNo || "",
          r.shipper || "",
          r.phone || "",
          r.address || "",
        ].join("|")
      )
      .join("\n");

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ket-qua-check-mvd.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const successCount = rows.filter(
    (r) => r.trackingNo || r.note === "Có đơn hàng"
  ).length;
  const emptyCount = rows.filter((r) => r.note === "Không có đơn hàng").length;
  const errorCount = rows.filter((r) => r.status === "Lỗi").length;

  return (
    <div
      style={{
        padding: 24,
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ marginBottom: 20 }}>Check Mã Vận Đơn TikTok - Vubel</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            "Dán session mỗi dòng.\nCó thể dùng dạng:\nsessionid=xxx\nhoặc sessionid=xxx|proxy"
          }
          style={{
            height: 170,
            padding: 14,
            borderRadius: 10,
            background: "#020617",
            color: "white",
            border: "1px solid #334155",
          }}
        />

        <div>

          <button onClick={parseRows} style={btn}>
            Tạo danh sách
          </button>

          <button
            onClick={checkAll}
            disabled={checkingAll || rows.length === 0}
            style={{ ...btn, background: "#ec4899", marginTop: 8 }}
          >
            {checkingAll ? "Đang check..." : "Check tất cả"}
          </button>

          <button
            onClick={exportTxt}
            disabled={rows.length === 0}
            style={{ ...btn, background: "#22c55e", marginTop: 8 }}
          >
            Export TXT
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={card}>Tổng: {rows.length}</div>
        <div style={card}>Có đơn: {successCount}</div>
        <div style={card}>Không đơn: {emptyCount}</div>
        <div style={card}>Lỗi: {errorCount}</div>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #334155" }}>
        <table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1300,
    background: "#020617",
    fontSize: 13,
  }}
>
  <thead>
    <tr>
      {[
        "Thao tác",
        "Session",
        "Mã Đơn",
        "Trạng thái",
        "Shop",
        "Tổng tiền",
       "Mã Vận Đơn",
"Đơn vị VC",
"Tên Shipper",
"SĐT Shipper",
"Trạng thái VC",
"Ghi chú giao hàng",
"Thanh toán",
        "Thời gian đặt",
        "Đã gửi",
        "Đã giao",
        "Người nhận",
        "SĐT",
        "Địa chỉ",
        "Sản phẩm",
      ].map((h) => (
        <th key={h} style={th}>
          {h}
        </th>
      ))}
    </tr>
  </thead>

  <tbody>
    {rows.map((r, i) => {
      const d = r.detail || {};
      const p = d?.products?.[0] || {};

      return (
        <tr key={i}>
          <td style={td}>
            <button
              onClick={() => checkOne(i)}
              disabled={r.checking}
              style={{
                padding: "6px 10px",
                background: "#2563eb",
                color: "white",
                border: 0,
                borderRadius: 6,
              }}
            >
              {r.checking ? "..." : "Check"}
            </button>
          </td>

          <td style={td}>{mask(r.session)}</td>
          <td style={td}>{d.orderId || r.orderId || ""}</td>
          <td style={td}>{d.status || r.status || ""}</td>
          <td style={td}>{d.shop || r.shopName || ""}</td>
          <td style={td}>{d.total || r.total || ""}</td>

          <td style={{ ...td, color: "#22c55e", fontWeight: 900 }}>
            {d.tracking || r.trackingNo || ""}
          </td>

          <td style={td}>
  {d.carrierName ||
   d.carrier ||
   d.shippingCompany ||
   d.logisticsCompany ||
   ""}
</td>

<td style={td}>
  {d.shipperName || d.shipper_name || ""}
</td>

<td style={td}>
  {(d.shipperPhone ||
    d.shipper_phone ||
    d.carrierPhone ||
    d.carrier_phone ||
    d.driverPhone ||
    d.driver_phone ||
    extractPhone(d.shippingNote || "") ||
    r.shipperPhone ||
    ""
  ).split(" Hotline")[0]}
</td>

<td style={td}>
  {d.shippingState || ""}
</td>

<td style={{ ...td, whiteSpace: "normal", minWidth: 280 }}>
  {d.shippingNote || ""}
</td>

<td style={td}>
  {d.paymentMethod || ""}
</td>
          <td style={td}>{d.createdAt || r.orderTime || ""}</td>
          <td style={td}>{d.shippedAt || ""}</td>
          <td style={td}>{d.deliveredAt || ""}</td>
          <td style={td}>{d.address?.name || r.account || ""}</td>
          <td style={td}>{d.address?.phone || r.phone || ""}</td>

          <td style={{ ...td, whiteSpace: "normal", minWidth: 360 }}>
            {d.address?.fullAddress || r.address || ""}
          </td>

          <td style={{ ...td, whiteSpace: "normal", minWidth: 360 }}>
            <b>{p.name || r.product || ""}</b>
            {p.qty && <div>Số lượng: {p.qty}</div>}
            {p.price && <div>Giá: {p.price}</div>}
            {p.variant && <div>Phân loại: {p.variant}</div>}
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
      </div>
    </div>
  );
}

function mask(s: string) {
  if (!s) return "";
  if (s.length <= 12) return s;
  return s.slice(0, 8) + "..." + s.slice(-8);
}
function extractPhone(text: string) {
  const match = text.match(/\+?\d[\d\s]{8,15}/);
  return match ? match[0].trim() : "";
}
const btn: any = {
  width: "100%",
  padding: "12px",
  borderRadius: 8,
  border: 0,
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const card: any = {
  background: "#020617",
  border: "1px solid #334155",
  padding: "12px 18px",
  borderRadius: 8,
  fontWeight: 700,
};

const th: any = {
  padding: 10,
  borderBottom: "1px solid #334155",
  borderRight: "1px solid #334155",
  background: "#111827",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const td: any = {
  padding: 10,
  borderBottom: "1px solid #1e293b",
  borderRight: "1px solid #1e293b",
  whiteSpace: "nowrap",
  color: "#e5e7eb",
};