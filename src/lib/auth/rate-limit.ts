import { readJson, writeJson } from "@/lib/storage/vercel-blob";
// Contador de falhas por IP guardado no Blob privado (a Vercel não mantém memória entre requisições).
type Att = Record<string, { n: number; until: number }>;
const P = "auth/attempts.json";
export async function isBlocked(ip: string) { const r = await readJson<Att>(P); return (r?.data[ip]?.until ?? 0) > Date.now(); }
export async function registerFail(ip: string) {
  const r = await readJson<Att>(P); const d = r?.data ?? {}; const n = (d[ip]?.n ?? 0) + 1;
  d[ip] = { n, until: n >= 5 ? Date.now() + Math.min(2 ** (n - 5), 60) * 60_000 : 0 };
  await writeJson(P, d).catch(() => {});
}
export async function clearFails(ip: string) { const r = await readJson<Att>(P); if (r?.data[ip]) { delete r.data[ip]; await writeJson(P, r.data).catch(() => {}); } }
