import { NextResponse } from "next/server";
import { supabaseDb } from "@/utils/supabaseDb";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let restConnectionSuccess = false;
  let restError: string | null = null;
  let teamsCount = 0;

  try {
    const { count, error } = await supabaseDb
      .from("teams")
      .select("*", { count: "exact", head: true });

    if (error) {
      restError = error.message;
    } else {
      restConnectionSuccess = true;
      teamsCount = count ?? 0;
    }
  } catch (err) {
    restError = err instanceof Error ? err.message : "Unknown error";
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    protocol: "HTTPS (Port 443)",
    supabase_configured: !!(supabaseUrl && anonKey),
    has_service_role_key: !!serviceRoleKey,
    supabase_rest_connection: {
      success: restConnectionSuccess,
      error: restError,
      teams_count: teamsCount,
    },
    message: restConnectionSuccess
      ? "✅ Supabase REST API connection verified successfully over Port 443"
      : "❌ Supabase REST API connection failed",
  });
}
