"use client";

import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Đăng nhập thành công");
      window.location.href = "/";
    } else {
      alert(data.message || "Đăng nhập thất bại");
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <div className="card">
        <h1 className="text-xl font-bold">Đăng nhập</h1>

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
          onClick={handleLogin}
        >
          Đăng nhập
        </button>
      </div>
    </main>
  );
}