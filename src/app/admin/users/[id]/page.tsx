"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function UserDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<any>(null);

  async function loadUser() {
    const res = await fetch(
      `/api/admin-user-detail/${id}`
    );

    const data = await res.json();

    if (res.ok) {
      setUser(data.user);
    } else {
      alert(data.message);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  if (!user) {
    return (
      <main style={{ padding: 30 }}>
        Đang tải...
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <a
        href="/admin/users"
        style={styles.backBtn}
      >
        ← Quay lại Users
      </a>

      <div style={styles.card}>
        <h1>{user.email}</h1>

        <p>Tên: {user.name || "-"}</p>

        <p>
          Số dư:
          {" "}
          <b>
            {Number(
              user.balance || 0
            ).toLocaleString("vi-VN")}
            đ
          </b>
        </p>

        <p>
          Tổng nạp:
          {" "}
          <b>
            {Number(
              user.totalDeposit || 0
            ).toLocaleString("vi-VN")}
            đ
          </b>
        </p>

        <p>
          Hoa hồng:
          {" "}
          <b>
            {Number(
              user.referralBalance || 0
            ).toLocaleString("vi-VN")}
            đ
          </b>
        </p>

        <p>
          VIP:
          <b> {user.vipLevel}</b>
        </p>

        <p>
          Quyền:
          <b> {user.role}</b>
        </p>
      </div>

      <div style={styles.card}>
        <h2>Lịch sử nạp tiền</h2>

        {user.deposits?.map((d: any) => (
          <div
            key={d.id}
            style={styles.row}
          >
            <span>
              {new Date(
                d.createdAt
              ).toLocaleString("vi-VN")}
            </span>

            <span>
              {Number(
                d.amount
              ).toLocaleString("vi-VN")}
              đ
            </span>

            <span>{d.status}</span>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <h2>Lịch sử đơn hàng</h2>

        {user.orders?.map((o: any) => (
          <div
            key={o.id}
            style={styles.row}
          >
            <span>{o.productName}</span>

            <span>
              {Number(
                o.amount
              ).toLocaleString("vi-VN")}
              đ
            </span>

            <span>
              {new Date(
                o.createdAt
              ).toLocaleString("vi-VN")}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    padding: 30,
  },

  backBtn: {
    color: "white",
    textDecoration: "none",
    display: "inline-block",
    marginBottom: 20,
  },

  card: {
    background: "#111827",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    border:
      "1px solid rgba(255,255,255,.1)",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom:
      "1px solid rgba(255,255,255,.08)",
  },
};