import { NextResponse } from "next/server";
import { z } from "zod";
import { hasSession } from "@/lib/auth/session";
import { readDb, writeDb, writeBackup, emptyDb, ConflictError } from "@/lib/storage/vercel-blob";
import type { Db, Op } from "@/types";
const COLS = ["categories", "cards", "expenses", "recurringExpenses", "invoices", "commitments"] as const;
const OpSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("upsert"), collection: z.enum(COLS), item: z.object({ id: z.string().min(1) }).passthrough() }),
  z.object({ type: z.literal("delete"), collection: z.enum(COLS), id: z.string().min(1) }),
]);
function apply(db: Db, op: Op): Db {
  const list = db[op.collection] as { id: string }[];
  const next = op.type === "upsert" ? (list.some((i) => i.id === op.item.id) ? list.map((i) => (i.id === op.item.id ? op.item : i)) : [...list, op.item]) : list.filter((i) => i.id !== op.id);
  const deleted = op.type === "delete" ? [...db.deleted, { id: op.id, collection: op.collection, deletedAt: new Date().toISOString() }] : db.deleted;
  return { ...db, [op.collection]: next, deleted, revision: db.revision + 1, updatedAt: new Date().toISOString() };
}
export async function GET() {
  if (!(await hasSession())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const cur = await readDb();
  if (!cur) { const db = emptyDb(); const etag = await writeDb(db); return NextResponse.json({ db, etag }); }
  return NextResponse.json({ db: cur.data, etag: cur.etag });
}
// Gravação por operação: se outro dispositivo gravou antes (ETag diferente), relê a versão nova e reaplica a operação (mescla por id).
export async function POST(req: Request) {
  if (!(await hasSession())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const op = OpSchema.safeParse(await req.json().catch(() => null));
  if (!op.success) return NextResponse.json({ error: "Operação inválida" }, { status: 400 });
  for (let i = 0; i < 4; i++) {
    const cur = (await readDb()) ?? { data: emptyDb(), etag: undefined };
    const next = apply(cur.data, op.data as Op);
    try {
      if (op.data.type === "delete" && i === 0) await writeBackup(cur.data);
      const etag = await writeDb(next, cur.etag);
      return NextResponse.json({ db: next, etag });
    } catch (e) { if (!(e instanceof ConflictError)) throw e; }
  }
  return NextResponse.json({ error: "Conflito: tente novamente." }, { status: 409 });
}
