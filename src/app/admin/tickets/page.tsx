"use client";

import { useEffect, useState } from "react";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [replyMap, setReplyMap] = useState<any>({});

  async function loadTickets() {
    const res = await fetch("/api/admin-tickets");

    if (res.ok) {
      const data = await res.json();
      setTickets(data.tickets || []);
    }
  }

  async function replyTicket(id: string) {
    const adminReply = replyMap[id] || "";

    if (!adminReply.trim()) {
      alert("Nhập nội dung trả lời");
      return;
    }

    const res = await fetch("/api/admin-tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        adminReply,
      }),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      setReplyMap((prev: any) => ({
        ...prev,
        [id]: "",
      }));
      loadTickets();
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: 30,
      }}
    >
      <h1>🎫 Quản lý hỗ trợ</h1>

      <a
        href="/admin/dashboard"
        style={{
          color: "#22d3ee",
          display: "inline-block",
          marginBottom: 20,
        }}
      >
        ← Quay lại Dashboard
      </a>

      {tickets.length === 0 && <p>Chưa có ticket nào.</p>}

      {tickets.map((t) => (
        <div
          key={t.id}
          style={{
            border: "1px solid #334155",
            borderRadius: 10,
            padding: 15,
            marginBottom: 15,
            background: "#111827",
          }}
        >
          <h3>{t.title}</h3>

          <p>
            <b>User:</b> {t.user?.email || "Không rõ"}
          </p>

          <p>
            <b>Nội dung:</b> {t.message}
          </p>

          <p>
            <b>Trạng thái:</b> {t.status}
          </p>

          {t.adminReply && (
            <p>
              <b>Đã trả lời:</b> {t.adminReply}
            </p>
          )}

          <textarea
            value={replyMap[t.id] || ""}
            onChange={(e) =>
              setReplyMap((prev: any) => ({
                ...prev,
                [t.id]: e.target.value,
              }))
            }
            placeholder="Nhập trả lời cho khách"
            style={{
              width: "100%",
              height: 90,
              padding: 12,
              marginBottom: 10,
            }}
          />

          <button
            onClick={() => replyTicket(t.id)}
            style={{
              padding: "10px 16px",
              cursor: "pointer",
              background: "#2563eb",
              color: "white",
              border: 0,
              borderRadius: 8,
              fontWeight: 800,
            }}
          >
            Trả lời
          </button>
        </div>
      ))}
    </main>
  );
}