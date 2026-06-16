"use client";

import { useEffect, useState } from "react";

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  async function loadTickets() {
    const res = await fetch("/api/tickets");

    if (res.ok) {
      const data = await res.json();
      setTickets(data.tickets || []);
    }
  }

  async function createTicket() {
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        message,
      }),
    });

    const data = await res.json();

    alert(data.message);

    if (res.ok) {
      setTitle("");
      setMessage("");
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
      <h1>🎫 Hỗ trợ khách hàng</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tiêu đề"
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 10,
        }}
      />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Nội dung"
        style={{
          width: "100%",
          height: 120,
          padding: 12,
          marginBottom: 10,
        }}
      />

      <button
        onClick={createTicket}
        style={{
          padding: "10px 16px",
          cursor: "pointer",
        }}
      >
        Gửi hỗ trợ
      </button>

      <hr style={{ margin: "20px 0" }} />

      {tickets.map((t) => (
        <div
          key={t.id}
          style={{
            border: "1px solid #334155",
            borderRadius: 10,
            padding: 15,
            marginBottom: 10,
          }}
        >
          <h3>{t.title}</h3>

          <p>{t.message}</p>

          <p>Trạng thái: {t.status}</p>

          {t.adminReply && (
            <div>
              <b>Admin:</b> {t.adminReply}
            </div>
          )}
        </div>
      ))}
    </main>
  );
}