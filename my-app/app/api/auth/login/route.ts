import { NextResponse } from "next/server";
import { findUser } from "@/lib/user-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identifier = String(body.identifier || "").trim();
    const password = String(body.password || "");

    if (!identifier || !password) {
      return NextResponse.json({ error: "Identifier and password are required." }, { status: 400 });
    }

    const adminId = "admin";
    const adminPassword = "1234";
    const isAdmin = identifier === adminId && password === adminPassword;

    if (isAdmin) {
      return NextResponse.json({ ok: true, role: "admin" });
    }

    const user = await findUser(identifier);
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    return NextResponse.json({ ok: true, role: user.role });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected login error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
