"use client";

import { useEffect, useState } from "react";

export default function RankPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/rank")
      .then((r) => r.json())
      .then(setData);
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
      <h1>🏆 Bảng xếp hạng</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginTop: 20,
        }}
      >
        <div
          style={{
            background: "#111827",
            padding: 20,
            borderRadius: 12,
          }}
        >
          <h2>💰 Top nạp tiền</h2>

          {data?.topDeposit?.map((u: any, i: number) => (
            <div
              key={u.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
              }}
            >
              <span>
                #{i + 1} {u.email}
              </span>

              <b>
                {Number(u.totalDeposit).toLocaleString("vi-VN")}đ
              </b>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "#111827",
            padding: 20,
            borderRadius: 12,
          }}
        >
          <h2>🎁 Top giới thiệu</h2>

          {data?.topReferral?.map((u: any, i: number) => (
            <div
              key={u.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
              }}
            >
              <span>
                #{i + 1} {u.email}
              </span>

              <b>
                {Number(u.referralBalance).toLocaleString("vi-VN")}đ
              </b>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}