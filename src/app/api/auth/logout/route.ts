import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE } from "@/lib/auth/session";
export async function POST() { (await cookies()).delete(COOKIE); return NextResponse.json({ ok: true }); }
