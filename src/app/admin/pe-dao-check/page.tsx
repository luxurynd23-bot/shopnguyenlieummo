"use client";

import { useEffect, useState } from "react";

type Row = {
  session: string;
  account?: string;
  note?: string;
  orderId?: string;
  orderTime?: string;
  product?: string;
  total?: string;
  status?: string;
  trackingNo?: string;
  shipperName?: string;
  shipperPhone?: string;
  phone?: string;
  address?: string;
  detail?: any;
  checking?: boolean;
  raw?: any;
};

const HISTORY_KEY = "pedao_mvd_history";
const CHECK_PRICE = 200;

export default function PeDaoCheckPage() {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [checkingAll, setCheckingAll] = useState(false);
  const [selectedRaw, setSelectedRaw] = useState<any>(null);
  const [apiBalance, setApiBalance] = useState<string | number>("");
  const [user, setUser] = useState<any>(null);
  const [serverHistory, setServerHistory] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setRows(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
  reloadUser();
  loadServerHistory();
}, []);

  async function reloadUser() {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    }
  }
async function loadServerHistory() {
  try {
    const res = await fetch("/api/tiktok/check-history", {
      cache: "no-store",
    });

    const data = await res.json();
    setServerHistory(data.history || []);
  } catch {
    setServerHistory([]);
  }
}
  function saveRows(nextRows: Row[]) {
    setRows(nextRows);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(nextRows));
  }

  function parseRows() {
  const list = input
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 100)
    .map((username) => ({
      session: username,
      note: "Chưa check",
      status: "Chờ check",
    }));

  saveRows(list);
}

  async function handleImportTxt(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setInput(text);
    e.target.value = "";
  }

  function canCheck() {
    return !!user && Number(user.balance || 0) >= CHECK_PRICE;
  }

  async function checkSession(session: string, retry = 2): Promise<Row> {
    try {
      const res = await fetch("/api/tiktok/vubel/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session, count: 5 }),
      });

      const data = await res.json();
      const body = data?.data || data;

      if (body?.billing?.balance !== undefined) {
        setApiBalance(body.billing.balance);
      }

      if (!data.success || !body?.ok) {
        const msg =
          body?.message ||
          body?.error ||
          data?.message ||
          data?.error ||
          "Check lỗi";

        if (retry > 0 && /proxy|timeout|ECONN|ENOTFOUND|CONNECT/i.test(msg)) {
          await delay(1200);
          return checkSession(session, retry - 1);
        }

        return {
          session,
          status: "Lỗi",
          note: msg,
          raw: data,
        };
      }

      const details =
        body?.data?.details ||
        body?.details ||
        body?.data?.orders ||
        body?.orders ||
        body?.items ||
        [];

      const firstOrder = Array.isArray(details) ? details[0] : null;

      if (!firstOrder) {
        return {
          session,
          status: "Hoạt động",
          note: "Không có đơn hàng",
          raw: data,
        };
      }

      const order = firstOrder?.order || {};
      const detail = firstOrder?.detail || {};
      const product = detail?.products?.[0] || order?.products?.[0] || {};

      return {
  session,
  checking: false,
  account: detail?.address?.name || "",
  note: detail?.shippingNote || "Có đơn hàng",
  orderId: detail?.orderId || order?.orderId || "",
  orderTime: detail?.createdAt || "",
  product: product?.name || "",
  total: detail?.total || order?.total || "",
  status: detail?.status || order?.status || "Có đơn hàng",
  trackingNo: detail?.tracking || "",
  shipperName: detail?.shipperName || "",
  shipperPhone: cleanPhone(
    detail?.shipperPhone || extractPhone(detail?.shippingNote || "")
  ),
  phone: detail?.address?.phone || "",
  address: detail?.address?.fullAddress || "",
  detail,
  raw: data,
};
    } catch (err) {
      if (retry > 0) {
        await delay(1200);
        return checkSession(session, retry - 1);
      }

      return {
        session,
        status: "Lỗi",
        note: String(err),
      };
    }
  }

  async function checkOne(index: number) {
    if (!canCheck()) {
      alert("Số dư không đủ. Cần 200đ/username để check.");
      return;
    }

    const row = rows[index];
    if (!row?.session) return;

    let nextRows = [...rows];
    nextRows[index] = {
      ...row,
      checking: true,
      status: "Đang check",
      note: "",
    };
    saveRows(nextRows);

    const result = await checkSession(row.session);

    nextRows = [...rows];
    nextRows[index] = {
      ...result,
      checking: false,
    };
    saveRows(nextRows);
await reloadUser();
await loadServerHistory();
  }

  async function checkAll() {
    if (rows.length === 0) return;

    if (!canCheck()) {
      alert("Số dư không đủ. Cần 200đ/username để check.");
      return;
    }

    setCheckingAll(true);

    let workingRows: Row[] = rows.map((r) => ({
      ...r,
      checking: true,
      status: "Đang check",
      note: "",
    }));

    saveRows(workingRows);

    const batchSize = 5;

    for (let start = 0; start < workingRows.length; start += batchSize) {
      await reloadUser();

      const currentBalance = Number(user?.balance || 0);
      if (currentBalance < CHECK_PRICE) {
        alert("Số dư không đủ để tiếp tục check.");
        break;
      }

      const batch = workingRows.slice(start, start + batchSize);

      const results = await Promise.all(
        batch.map((r) => checkSession(r.session))
      );

      workingRows = [...workingRows];

      results.forEach((result, offset) => {
        workingRows[start + offset] = {
          ...result,
          checking: false,
        };
      });

      saveRows(workingRows);
await reloadUser();
await loadServerHistory();
await delay(900);
    }

    setCheckingAll(false);
  }

  function copy(text?: string) {
    if (!text) return alert("Không có dữ liệu");
    navigator.clipboard.writeText(text);
    alert("Đã copy");
  }

  function exportTxt() {
    const text = rows.map(rowToLine).join("\n");
    downloadFile("pedao-check-mvd.txt", text, "text/plain;charset=utf-8");
  }

  function exportExcel() {
    const html = `
      <table border="1">
        <tr>
          <th>Session</th><th>Mã đơn</th><th>Trạng thái</th>
          <th>Tổng tiền</th><th>Mã vận đơn</th>
          <th>Tên shipper</th><th>SĐT shipper</th>
          <th>Ghi chú</th><th>Thời gian đặt</th>
          <th>Người nhận</th>
          <th>SĐT khách</th><th>Địa chỉ</th><th>Sản phẩm</th>
        </tr>
        ${rows
          .map(
            (r) => `
          <tr>
            <td>${esc(r.session)}</td>
            <td>${esc(r.orderId)}</td>
            <td>${esc(r.status)}</td>
            <td>${esc(r.total)}</td>
            <td>${esc(r.trackingNo)}</td>
            <td>${esc(r.shipperName)}</td>
            <td>${esc(r.shipperPhone)}</td>
            <td>${esc(r.note)}</td>
            <td>${esc(r.orderTime)}</td>
            <td>${esc(r.account)}</td>
            <td>${esc(r.phone)}</td>
            <td>${esc(r.address)}</td>
            <td>${esc(r.product)}</td>
          </tr>
        `
          )
          .join("")}
      </table>
    `;

    downloadFile("pedao-check-mvd.xls", html, "application/vnd.ms-excel");
  }

  function clearHistory() {
    if (!confirm("Xóa toàn bộ lịch sử?")) return;
    localStorage.removeItem(HISTORY_KEY);
    setRows([]);
  }

  const total = rows.length;
  const hasOrder = rows.filter((r) => r.trackingNo).length;
  const noOrder = rows.filter((r) => r.note === "Không có đơn hàng").length;
  const error = rows.filter((r) => r.status === "Lỗi").length;
  const walletBalance = Number(user?.balance || 0);

  return (
    <div style={styles.page}>
      <h1 style={{ marginBottom: 20 }}>🚚 Pé Đào - Check Mã Vận Đơn TikTok</h1>

      <div style={styles.inputGrid}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Dán username TikTok, mỗi dòng 1 username. Tối đa 100 username/lần."
          style={styles.textarea}
        />

        <div>
          <input
            type="file"
            accept=".txt"
            onChange={handleImportTxt}
            style={styles.file}
          />

          <button onClick={parseRows} style={styles.btn}>
            Tạo danh sách
          </button>

          <button
            onClick={checkAll}
            disabled={checkingAll || rows.length === 0 || !canCheck()}
            style={{
              ...styles.pinkBtn,
              opacity: checkingAll || rows.length === 0 || !canCheck() ? 0.55 : 1,
            }}
          >
            {checkingAll ? "Đang check..." : "Check tất cả 5 luồng"}
          </button>

          <button
            onClick={exportExcel}
            disabled={rows.length === 0}
            style={styles.greenBtn}
          >
            Export Excel
          </button>

          <button
            onClick={exportTxt}
            disabled={rows.length === 0}
            style={styles.greenBtn}
          >
            Export TXT
          </button>

          <button onClick={clearHistory} style={styles.redBtn}>
            Xóa lịch sử
          </button>
        </div>
      </div>

      <div style={styles.cards}>
        <div style={styles.card}>Tổng: {total}</div>
        <div style={styles.card}>Có đơn: {hasOrder}</div>
        <div style={styles.card}>Không đơn: {noOrder}</div>
        <div style={styles.card}>Lỗi: {error}</div>
        <div style={styles.card}>
          Số dư ví: {walletBalance.toLocaleString("vi-VN")}đ
        </div>
        <div style={styles.card}>Giá check: 200đ/username</div>
        
      </div>

      {!user && (
        <div style={styles.warn}>
          Bạn cần đăng nhập để sử dụng tool check MVD.
        </div>
      )}

      {user && walletBalance < CHECK_PRICE && (
        <div style={styles.warn}>
          Số dư không đủ. Vui lòng nạp thêm tiền để check MVD.
        </div>
      )}

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {[
  "Thao tác",
  "Username",
  "Mã Đơn",
  "Trạng thái",
  "Tổng tiền",
  "Mã Vận Đơn",
  "Tên Shipper",
  "SĐT Shipper",
  "Ghi chú",
  "Thời gian đặt",
  "Người nhận",
  "SĐT",
  "Địa chỉ",
  "Sản phẩm",
  "JSON",
].map((h) => (
                <th key={h} style={styles.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={styles.td}>
                  <button
                    onClick={() => checkOne(i)}
                    disabled={r.checking || !canCheck()}
                    style={{
                      ...styles.smallBtn,
                      opacity: r.checking || !canCheck() ? 0.55 : 1,
                    }}
                  >
                    {r.checking ? "..." : "Check"}
                  </button>
                </td>

                <td style={styles.td}>{mask(r.session)}</td>
                <td style={styles.td}>{r.orderId || ""}</td>
                <td style={styles.td}>{r.status || ""}</td>
                <td style={styles.td}>{r.total || ""}</td>

                <td style={{ ...styles.td, color: "#22c55e", fontWeight: 900 }}>
                  {r.trackingNo || ""}
                  {r.trackingNo && (
                    <button
                      onClick={() => copy(r.trackingNo)}
                      style={styles.copyBtn}
                    >
                      Copy
                    </button>
                  )}
                </td>

                <td style={styles.td}>{r.shipperName || ""}</td>
                <td style={styles.td}>{r.shipperPhone || ""}</td>
                <td style={{ ...styles.td, whiteSpace: "normal", minWidth: 280 }}>
                  {r.note || ""}
                </td>
                <td style={styles.td}>{r.orderTime || ""}</td>
                <td style={styles.td}>{r.account || ""}</td>
                <td style={styles.td}>{r.phone || ""}</td>
                <td style={{ ...styles.td, whiteSpace: "normal", minWidth: 360 }}>
                  {r.address || ""}
                </td>

                <td style={{ ...styles.td, whiteSpace: "normal", minWidth: 360 }}>
                  <b>{r.product || ""}</b>
                  {r.detail?.products?.[0]?.qty && (
                    <div>Số lượng: {r.detail.products[0].qty}</div>
                  )}
                  {r.detail?.products?.[0]?.price && (
                    <div>Giá: {r.detail.products[0].price}</div>
                  )}
                  {r.detail?.products?.[0]?.variant && (
                    <div>Phân loại: {r.detail.products[0].variant}</div>
                  )}
                </td>

                <td style={styles.td}>
                  <button
                    onClick={() => setSelectedRaw(r.raw)}
                    style={styles.jsonBtn}
                  >
                    JSON
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
<div style={{ marginTop: 30 }}>
  <h2>📜 Lịch sử Check MVD</h2>

  <div style={styles.tableWrap}>
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Thời gian</th>
          <th style={styles.th}>Mã đơn</th>
          <th style={styles.th}>Mã vận đơn</th>
          <th style={styles.th}>Sản phẩm</th>
          <th style={styles.th}>Tổng tiền</th>
          <th style={styles.th}>Shipper</th>
          <th style={styles.th}>SĐT Shipper</th>
          <th style={styles.th}>Phí</th>
        </tr>
      </thead>

      <tbody>
        {serverHistory.map((r) => (
          <tr key={r.id}>
            <td style={styles.td}>
              {new Date(r.createdAt).toLocaleString("vi-VN")}
            </td>
            <td style={styles.td}>{r.orderId}</td>
            <td style={styles.td}>{r.trackingNo}</td>
            <td style={styles.td}>{r.product}</td>
            <td style={styles.td}>{r.total}</td>
            <td style={styles.td}>{r.shipperName}</td>
            <td style={styles.td}>{r.shipperPhone}</td>
            <td style={styles.td}>
              {Number(r.cost || 0).toLocaleString("vi-VN")}đ
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
      {selectedRaw && (
        <div style={styles.modal}>
          <div style={styles.modalBox}>
            <button
              onClick={() => setSelectedRaw(null)}
              style={styles.closeBtn}
            >
              Đóng
            </button>
            <pre style={styles.pre}>{JSON.stringify(selectedRaw, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

function rowToLine(r: Row) {
  return [
  r.session,
  r.orderId,
  r.status,
  r.total,
  r.trackingNo,
  r.shipperName,
  r.shipperPhone,
  r.note,
  r.orderTime,
  r.account,
  r.phone,
  r.address,
  r.product,
].join("|");
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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

function cleanPhone(text: string) {
  return String(text || "").split(" Hotline")[0].trim();
}

function esc(v: any) {
  return String(v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const styles: any = {
  page: {
    padding: 24,
    background: "#0f172a",
    minHeight: "100vh",
    color: "white",
    fontFamily: "Arial",
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 16,
    marginBottom: 16,
  },
  textarea: {
    height: 170,
    padding: 14,
    borderRadius: 10,
    background: "#020617",
    color: "white",
    border: "1px solid #334155",
  },
  file: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    background: "#020617",
    color: "white",
    border: "1px solid #334155",
    marginBottom: 8,
  },
  btn: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: 0,
    background: "#2563eb",
    color: "white",
    fontWeight: 800,
    marginBottom: 8,
    cursor: "pointer",
  },
  pinkBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: 0,
    background: "#ec4899",
    color: "white",
    fontWeight: 800,
    marginBottom: 8,
    cursor: "pointer",
  },
  greenBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: 0,
    background: "#22c55e",
    color: "white",
    fontWeight: 800,
    marginBottom: 8,
    cursor: "pointer",
  },
  redBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: 0,
    background: "#dc2626",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  },
  cards: {
    display: "flex",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  card: {
    background: "#020617",
    border: "1px solid #334155",
    padding: "12px 18px",
    borderRadius: 8,
    fontWeight: 900,
  },
  warn: {
    background: "#7f1d1d",
    border: "1px solid #ef4444",
    color: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontWeight: 800,
  },
  tableWrap: {
    overflowX: "auto",
    border: "1px solid #334155",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1700,
    background: "#020617",
    fontSize: 13,
  },
  th: {
    padding: 10,
    borderBottom: "1px solid #334155",
    borderRight: "1px solid #334155",
    background: "#111827",
    whiteSpace: "nowrap",
    textAlign: "left",
  },
  td: {
    padding: 10,
    borderBottom: "1px solid #1e293b",
    borderRight: "1px solid #1e293b",
    whiteSpace: "nowrap",
  },
  smallBtn: {
    padding: "6px 10px",
    background: "#2563eb",
    color: "white",
    border: 0,
    borderRadius: 6,
    cursor: "pointer",
  },
  copyBtn: {
    marginLeft: 8,
    padding: "4px 8px",
    background: "#16a34a",
    color: "white",
    border: 0,
    borderRadius: 5,
    cursor: "pointer",
  },
  jsonBtn: {
    padding: "5px 10px",
    background: "#7c3aed",
    color: "white",
    border: 0,
    borderRadius: 5,
    cursor: "pointer",
  },
  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.75)",
    padding: 30,
    zIndex: 9999,
  },
  modalBox: {
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: 12,
    padding: 20,
    maxHeight: "90vh",
    overflow: "auto",
  },
  closeBtn: {
    float: "right",
    background: "#dc2626",
    color: "white",
    border: 0,
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
  },
  pre: {
    whiteSpace: "pre-wrap",
    color: "#e5e7eb",
  },
};
