"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    setMsg(data.message);
  }

  return (
    <form onSubmit={handleRegister} className="max-w-sm mx-auto mt-16 flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-2">Register</h1>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="border px-2 py-1" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="border px-2 py-1" />
      <button type="submit" className="bg-blue-600 text-white py-1">Register</button>
      <div className="text-sm text-black">{msg}</div>
    </form>
  );
}
