import "server-only";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.warn("[supabaseDb] Supabase environment variables are missing.");
}

/**
 * Server-side Supabase client for all database queries and mutations.
 * Communicates over standard HTTPS (Port 443), bypassing campus firewall port blocks.
 */
export const supabaseDb = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Generates a valid UUID v4 for new records
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Formats database errors into consistent human-readable messages
 */
export function formatDbError(error: any, fallbackMessage = "Database operation failed"): string {
  if (!error) return fallbackMessage;

  // Postgres unique violation
  if (error.code === "23505") {
    if (error.message?.includes("teams_name_key") || error.details?.includes("name")) {
      return "A team with this name already exists";
    }
    if (error.message?.includes("members_linkedin_key") || error.details?.includes("linkedin")) {
      return "A member with this LinkedIn URL already exists";
    }
    if (error.message?.includes("roles_name_key") || error.details?.includes("name")) {
      return "A role with this name already exists";
    }
    return "A record with this identifier already exists";
  }

  // Postgres foreign key violation
  if (error.code === "23503") {
    if (error.details?.includes("team_id")) {
      return "Referenced team not found";
    }
    if (error.details?.includes("role_id")) {
      return "Referenced role not found";
    }
    return "Referenced record not found";
  }

  // Not found (PostgREST single row expectation)
  if (error.code === "PGRST116") {
    return "Record not found";
  }

  return error.message || fallbackMessage;
}
