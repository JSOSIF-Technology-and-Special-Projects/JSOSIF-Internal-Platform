import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { supabaseDb } from "@/utils/supabaseDb";
import { notificationTestEmail } from "./notification-config";
import { isCeoDescription, isProposalId, type ProposalViewer, type TradeProposal } from "./proposals";

export async function currentCeo() {
  const { data, error } = await supabaseDb.from("members").select("name, description, user_id").is("graduated_at", null);
  if (error) throw new Error("Unable to identify the current CEO.");
  const candidates = (data || []).filter(member => isCeoDescription(member.description));
  // Ambiguous assignments must never give multiple people approval permission.
  if (candidates.length !== 1 || !isProposalId(candidates[0].user_id)) return null;
  const candidate = candidates[0];
  const account = await supabaseDb.auth.admin.getUserById(candidate.user_id);
  if (account.error || !account.data.user?.email || account.data.user.id !== candidate.user_id) return null;
  return { id: account.data.user.id, email: account.data.user.email, name: candidate.name };
}

export async function getProposalViewer(): Promise<ProposalViewer | null> {
  const client = createClient(await cookies());
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  const [{ data: member, error: memberError }, approver] = await Promise.all([
    supabaseDb.from("members").select("name").eq("user_id", user.id).maybeSingle(),
    currentCeo(),
  ]);
  if (memberError) throw new Error("Unable to load your member profile.");
  const metadataName = user.user_metadata?.full_name || user.user_metadata?.name;
  const name = member?.name || (typeof metadataName === "string" ? metadataName : null) || user.email || "Member";
  const displayName = String(name).trim().slice(0, 255);
  return { id: user.id, name: displayName, canReview: Boolean(approver && user.id === approver.id), approvalConfigured: Boolean(approver), approverName: approver?.name || null, notificationTestEmail: notificationTestEmail() };
}

interface ProposalRow {
  id: string; author_id: string; author_name: string; status: TradeProposal["status"];
  legs: TradeProposal["legs"]; simulation: TradeProposal["simulation"];
  reason: string; review_note: string; reviewer_name: string | null;
  submitted_at: string | null; reviewed_at: string | null; created_at: string; updated_at: string;
  notification_status: TradeProposal["notificationStatus"]; notification_attempted_at: string | null; notified_at: string | null;
}
export function mapProposal(row: ProposalRow): TradeProposal {
  return { id: row.id, authorId: row.author_id, authorName: row.author_name, status: row.status, legs: row.legs, simulation: row.simulation, reason: row.reason, reviewNote: row.review_note, reviewerName: row.reviewer_name, submittedAt: row.submitted_at, reviewedAt: row.reviewed_at, createdAt: row.created_at, updatedAt: row.updated_at, notificationStatus: row.notification_status || "not_sent", notificationAttemptedAt: row.notification_attempted_at || null, notifiedAt: row.notified_at || null };
}
export function visibleProposals(viewer: ProposalViewer) {
  const query = supabaseDb.from("trade_proposals").select("*");
  return viewer.canReview ? query.or(`author_id.eq.${viewer.id},status.neq.draft`) : query.eq("author_id", viewer.id);
}
export function proposalError(error: unknown) {
  const code = error && typeof error === "object" && "code" in error ? error.code : null;
  if (code === "42P01" || code === "PGRST205" || code === "42703" || code === "PGRST204") return { error: "Trade submission and notification storage haven’t been configured yet.", status: 503 };
  console.error("Trade proposal request failed:", error);
  return { error: "Unable to save or load trade proposals. Please try again.", status: 500 };
}
