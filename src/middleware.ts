import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
export async function middleware(req: NextRequest) {
  const t = req.cookies.get("fin_session")?.value;
  try { await jwtVerify(t!, new TextEncoder().encode(process.env.SESSION_SECRET!)); return NextResponse.next(); }
  catch { return NextResponse.redirect(new URL("/login", req.url)); }
}
export const config = { matcher: ["/((?!login|api|_next|favicon.ico|manifest.json|icons).*)"] };
