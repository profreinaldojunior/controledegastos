"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Check, Trash2, Plus, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import type { Db, Expense, Op } from "@/types";
import { brl, dateBr, monthKey, shiftMonth } from "@/lib/utils/format";

export default function Home() {
  const [db, setDb] = useState<Db | null>(null);
  const [sync, setSync] = useState<{ state: "ok" | "busy" | "error"; at?: string }>({ state: "busy" });
  const [month, setMonth] = useState(monthKey());
  const [f, setF] = useState({ description: "", amount: "", date: "" });

  const load = useCallback(async () => {
    setSync((s) => ({ ...s, state: "busy" }));
    try {
      const r = await fetch("/api/data", { cache: "no-store" });
      if (r.status === 401) return void (location.href = "/login");
      const j = await r.json(); setDb(j.db);
      setSync({ state: "ok", at: new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" }) });
    } catch { setSync((s) => ({ ...s, state: "error" })); }
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 30000); const v = () => document.visibilityState === "visible" && load(); document.addEventListener("visibilitychange", v); return () => { clearInterval(t); document.removeEventListener("visibilitychange", v); }; }, [load]);

  async function send(op: Op) {
    setSync((s) => ({ ...s, state: "busy" }));
    const r = await fetch("/api/data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(op) });
    if (!r.ok) return setSync((s) => ({ ...s, state: "error" }));
    setDb((await r.json()).db); setSync({ state: "ok", at: new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" }) });
  }
  function add(e: React.FormEvent) {
    e.preventDefault();
    const cents = Math.round(parseFloat(f.amount.replace(".", "").replace(",", ".")) * 100);
    if (!f.description || !f.date || !(cents > 0)) return;
    const item: Expense = { id: crypto.randomUUID(), date: f.date, description: f.description, categoryId: "", amount: cents, status: "pending", paidAt: null, notes: "", origin: { type: "manual", refId: null, month: f.date.slice(0, 7) } };
    send({ type: "upsert", collection: "expenses", item: item as never }); setF({ description: "", amount: "", date: "" });
  }
  const list = useMemo(() => (db?.expenses ?? []).filter((x) => x.date.startsWith(month)).sort((a, b) => a.date.localeCompare(b.date)), [db, month]);
  const sum = (s?: string) => list.filter((x) => !s || x.status === s).reduce((t, x) => t + x.amount, 0);
  const today = new Date().toISOString().slice(0, 10);
  const label = new Date(`${month}-01T12:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const card = "rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900";

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button aria-label="Mês anterior" onClick={() => setMonth(shiftMonth(month, -1))}><ChevronLeft /></button>
          <h1 className="w-44 text-center text-lg font-semibold capitalize">{label}</h1>
          <button aria-label="Próximo mês" onClick={() => setMonth(shiftMonth(month, 1))}><ChevronRight /></button>
        </div>
        <div className="flex items-center gap-3 text-sm text-stone-500">
          <span className={sync.state === "error" ? "text-red-600" : ""}>{sync.state === "busy" ? "Sincronizando..." : sync.state === "error" ? "Sem conexão" : `Sincronizado ${sync.at}`}</span>
          <button aria-label="Sincronizar" onClick={load}><RefreshCw size={18} /></button>
          <button aria-label="Sair" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/login"; }}><LogOut size={18} /></button>
        </div>
      </header>
      <section className="grid grid-cols-3 gap-3">
        {[["Previsto", sum()], ["Pago", sum("paid")], ["Pendente", sum("pending")]].map(([k, v]) => (
          <div key={k as string} className={card}><p className="text-sm text-stone-500">{k}</p><p className="text-lg font-semibold">{brl(v as number)}</p></div>
        ))}
      </section>
      <form onSubmit={add} className={`${card} flex flex-wrap gap-2`}>
        <input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Descrição" className="min-w-40 flex-1 rounded-lg border border-stone-300 bg-transparent px-3 py-2 dark:border-stone-700" />
        <input value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} placeholder="Valor (1500,00)" inputMode="decimal" className="w-36 rounded-lg border border-stone-300 bg-transparent px-3 py-2 dark:border-stone-700" />
        <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className="rounded-lg border border-stone-300 bg-transparent px-3 py-2 dark:border-stone-700" />
        <button className="flex items-center gap-1 rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white"><Plus size={16} />Adicionar</button>
      </form>
      <section className={`${card} divide-y divide-stone-200 p-0 dark:divide-stone-800`}>
        {list.length === 0 && <p className="p-4 text-stone-500">Nenhuma despesa neste mês. Use o formulário acima para adicionar.</p>}
        {list.map((x) => {
          const color = x.status === "paid" ? "bg-emerald-500" : x.date < today ? "bg-red-500" : "bg-stone-400";
          return (
            <div key={x.id} className="flex items-center gap-3 p-3">
              <span className={`size-2.5 rounded-full ${color}`} />
              <div className="flex-1"><p className="font-medium">{x.description}</p><p className="text-sm text-stone-500">{dateBr(x.date)}</p></div>
              <span className="font-semibold">{brl(x.amount)}</span>
              <button aria-label="Marcar como paga" onClick={() => send({ type: "upsert", collection: "expenses", item: { ...x, status: x.status === "paid" ? "pending" : "paid", paidAt: x.status === "paid" ? null : new Date().toISOString() } as never })}><Check size={18} /></button>
              <button aria-label="Excluir" onClick={() => confirm("Excluir esta despesa?") && send({ type: "delete", collection: "expenses", id: x.id })}><Trash2 size={18} /></button>
            </div>
          );
        })}
      </section>
    </main>
  );
}
