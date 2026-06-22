import { NextResponse } from "next/server";
import { addUser, findUser } from "@/lib/user-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identifier = String(body.identifier || "").trim();
    const password = String(body.password || "");
    const role = body.role === "buyer" || body.role === "expert" ? body.role : "farmer";

    if (!identifier || !password) {
      return NextResponse.json({ error: "Identifier and password are required." }, { status: 400 });
    }

    if (identifier.toLowerCase() === "admin") {
      return NextResponse.json({ error: "Admin account is reserved." }, { status: 400 });
    }

    const existing = await findUser(identifier);
    if (existing) {
      return NextResponse.json({ error: "User already exists." }, { status: 409 });
    }

    await addUser({ identifier, password, role });
    return NextResponse.json({ ok: true, role });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected registration error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
