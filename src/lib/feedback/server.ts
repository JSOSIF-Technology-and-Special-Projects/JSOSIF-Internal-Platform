import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { supabaseDb } from "@/utils/supabaseDb";
import type { FeedbackKind, FeedbackStatus, FeedbackSubmission, FeedbackViewer } from "./types";

export class FeedbackError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export async function feedbackViewer(): Promise<FeedbackViewer> {
  const client = createClient(await cookies());
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new FeedbackError("Please sign in to use feedback.", 401);
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new FeedbackError("Feedback is not available yet. An administrator needs to complete setup.", 503);
  const [member, profile] = await Promise.all([
    supabaseDb.from("members").select("name, role:roles(name)").eq("user_id", user.id).maybeSingle(),
    supabaseDb.from("profiles").select("role").eq("id", user.id).maybeSingle(),
  ]);
  if (member.error || profile.error) throw new FeedbackError("Unable to verify your feedback permissions. Please try again.", 503);
  const role = Array.isArray(member.data?.role) ? member.data.role[0] : member.data?.role;
  const isAdmin = [profile.data?.role, role?.name].some(value => typeof value === "string" && value.toLowerCase() === "admin");
  const metadataName = user.user_metadata?.full_name || user.user_metadata?.name;
  const name = String(member.data?.name || (typeof metadataName === "string" ? metadataName : null) || user.email || "Member").trim().slice(0, 255);
  return { id: user.id, name, isAdmin };
}
export interface FeedbackRow {
  id: string; author_id: string; author_name: string; kind: FeedbackKind; message: string;
  page_path: string | null; status: FeedbackStatus; reviewed_by_name: string | null;
  reviewed_at: string | null; created_at: string; updated_at: string;
}
export function mapFeedback(row: FeedbackRow): FeedbackSubmission {
  return { id: row.id, authorId: row.author_id, authorName: row.author_name, kind: row.kind, message: row.message, pagePath: row.page_path, status: row.status, reviewedByName: row.reviewed_by_name, reviewedAt: row.reviewed_at, createdAt: row.created_at, updatedAt: row.updated_at };
}
export function feedbackFailure(error: unknown) {
  if (error instanceof FeedbackError) return { error: error.message, status: error.status };
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "unknown";
  if (["42P01", "42703", "42501", "PGRST204", "PGRST205"].includes(code)) return { error: "Feedback is not available yet. An administrator needs to complete setup.", status: 503, setupRequired: true };
  console.error("Feedback request failed:", code);
  return { error: "Unable to save or load feedback. Please try again.", status: 500 };
}
