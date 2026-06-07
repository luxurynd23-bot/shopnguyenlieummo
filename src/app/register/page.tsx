"use client";

import { useState } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Đăng ký thành công");
      window.location.href = "/login";
    } else {
      alert(data.message || "Đăng ký thất bại");
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <div className="card">
        <h1 className="text-xl font-bold">Đăng ký</h1>

        <input
          className="input mt-3"
          placeholder="Tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="input mt-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input mt-3"
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="btn mt-4 w-full"
          onClick={handleRegister}
        >
          Tạo tài khoản
        </button>
      </div>
    </main>
  );
}