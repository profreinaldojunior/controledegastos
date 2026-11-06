import bcrypt from "bcryptjs";
import { z } from "zod";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { isBlocked, registerFail, clearFails } from "@/lib/auth/rate-limit";
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (await isBlocked(ip)) return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
  const body = z.object({ password: z.string().min(1).max(200) }).safeParse(await req.json().catch(() => null));
  const ok = body.success && (await bcrypt.compare(body.data.password, process.env.AUTH_PASSWORD_HASH ?? ""));
  if (!ok) { await registerFail(ip); return NextResponse.json({ error: "Senha incorreta." }, { status: 401 }); }
  await clearFails(ip); await createSession();
  return NextResponse.json({ ok: true });
}
