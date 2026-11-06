"use client";
import { useState } from "react";
export default function Login() {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (r.ok) location.href = "/"; else { setErr((await r.json()).error ?? "Erro ao entrar."); setBusy(false); }
  }
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <h1 className="text-xl font-semibold">Entrar no Financeiro</h1>
        <input type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Senha" className="w-full rounded-lg border border-stone-300 bg-transparent px-3 py-2 dark:border-stone-700" />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-emerald-700 py-2 font-medium text-white disabled:opacity-60">{busy ? "Entrando..." : "Entrar"}</button>
      </form>
    </main>
  );
}
