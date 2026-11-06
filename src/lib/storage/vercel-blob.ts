import { put, get, BlobPreconditionFailedError } from "@vercel/blob";
import type { Db } from "@/types";
// Camada de armazenamento isolada: para migrar de serviço, reimplemente estas 3 funções.
const PATH = "financeiro.json";
export { BlobPreconditionFailedError as ConflictError };
export const emptyDb = (): Db => { const n = new Date().toISOString(); return { version: 1, revision: 0, createdAt: n, updatedAt: n, settings: {}, categories: [], cards: [], expenses: [], recurringExpenses: [], invoices: [], commitments: [], deleted: [] }; };
export async function readJson<T>(path: string): Promise<{ data: T; etag: string } | null> {
  const r = await get(path, { access: "private" });
  if (!r || r.statusCode !== 200) return null;
  return { data: JSON.parse(await new Response(r.stream).text()) as T, etag: r.blob.etag };
}
export async function writeJson(path: string, data: unknown, etag?: string) {
  const res = await put(path, JSON.stringify(data), { access: "private", allowOverwrite: true, addRandomSuffix: false, contentType: "application/json", ...(etag ? { ifMatch: etag } : {}) });
  return res.etag;
}
export const readDb = () => readJson<Db>(PATH);
export const writeDb = (db: Db, etag?: string) => writeJson(PATH, db, etag);
export const writeBackup = (db: Db) => writeJson(`backups/${new Date().toISOString().replace(/[:.]/g, "-")}.json`, db);
