// src/app/api/auth/jit/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
);

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) as { email: string; password: string };
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Best-effort create; if the user already exists, ignore that specific error.
    const { error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createErr) {
      // Ignore "already registered" (HTTP 422) and continue
      const msg = (createErr as any)?.message?.toLowerCase?.() ?? "";
      const code = (createErr as any)?.status ?? (createErr as any)?.statusCode;

      const alreadyExists =
        code === 422 || msg.includes("already registered") || msg.includes("user already exists");

      if (!alreadyExists) {
        return NextResponse.json({ error: createErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
