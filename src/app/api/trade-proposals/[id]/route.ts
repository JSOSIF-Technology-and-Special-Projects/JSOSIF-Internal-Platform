import { NextResponse } from "next/server";
import { supabaseDb } from "@/utils/supabaseDb";
import { isProposalId, isRecord } from "@/lib/trades/proposals";
import { getProposalViewer, mapProposal, proposalError, visibleProposals } from "@/lib/trades/server";
import { deliverProposalNotification } from "@/lib/trades/notifications";

export const runtime = "nodejs";
export const maxDuration = 60;

type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  try {
    const viewer = await getProposalViewer();
    if (!viewer) return NextResponse.json({ error: "Please sign in to view proposals." }, { status: 401 });
    const { id } = await params;
    if (!isProposalId(id)) return NextResponse.json({ error: "Invalid proposal ID." }, { status: 400 });
    const { data, error } = await visibleProposals(viewer).eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
    return NextResponse.json({ data: mapProposal(data), viewer });
  } catch (error) {
    const result = proposalError(error);
    return NextResponse.json(result, { status: result.status });
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const viewer = await getProposalViewer();
    if (!viewer) return NextResponse.json({ error: "Please sign in to update proposals." }, { status: 401 });
    const { id } = await params;
    if (!isProposalId(id)) return NextResponse.json({ error: "Invalid proposal ID." }, { status: 400 });
    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
    if (isRecord(body) && body.action === "retry_notification") {
      const record = await visibleProposals(viewer).eq("id", id).maybeSingle();
      if (record.error) throw record.error;
      if (!record.data || record.data.status !== "pending") return NextResponse.json({ error: "Only pending proposals can have notification emails retried." }, { status: 409 });
      if (record.data.notification_status === "sent") return NextResponse.json({ data: mapProposal(record.data), notice: "The notification email was already sent." });
      const previous = record.data;
      const age = previous.notification_attempted_at ? Date.now() - Date.parse(previous.notification_attempted_at) : Infinity;
      if (previous.notification_status === "sending" && age < 300000) return NextResponse.json({ error: "The email is already being sent. Wait and refresh the proposal." }, { status: 409 });
      if (age < 30000) return NextResponse.json({ error: "Please wait 30 seconds between email attempts." }, { status: 429 });
      let claim = supabaseDb.from("trade_proposals").update({ notification_status: "sending", notification_attempted_at: new Date().toISOString() }).eq("id", id).eq("status", "pending").eq("notification_status", previous.notification_status);
      claim = previous.notification_attempted_at ? claim.eq("notification_attempted_at", previous.notification_attempted_at) : claim.is("notification_attempted_at", null);
      const claimed = await claim.select("*").maybeSingle();
      if (claimed.error) throw claimed.error;
      if (!claimed.data) return NextResponse.json({ error: "Another email attempt is already in progress. Refresh the proposal." }, { status: 409 });
      const delivery = await deliverProposalNotification(claimed.data);
      return NextResponse.json({ data: mapProposal(delivery.data || claimed.data), warning: delivery.warning });
    }
    if (!isRecord(body) || typeof body.expectedUpdatedAt !== "string" || !Number.isFinite(Date.parse(body.expectedUpdatedAt))) return NextResponse.json({ error: "Reload the proposal before saving changes." }, { status: 400 });
    const now = new Date().toISOString();
    let mutation;
    if (body.action === "save" || body.action === "submit") {
      if (typeof body.reason !== "string" || body.reason.trim().length > 5000 || (body.action === "submit" && !body.reason.trim())) return NextResponse.json({ error: "Add your investment reasoning (up to 5,000 characters)." }, { status: 400 });
      if (body.action === "submit" && !viewer.approvalConfigured) return NextResponse.json({ error: "The CEO approver must be assigned before proposals can be submitted. Your draft is still saved." }, { status: 503 });
      mutation = supabaseDb.from("trade_proposals").update({ reason: body.reason.trim(), updated_at: now, ...(body.action === "submit" ? { status: "pending", submitted_at: now, notification_status: "sending", notification_attempted_at: now } : {}) }).eq("author_id", viewer.id).eq("status", "draft");
    } else if (body.action === "approve" || body.action === "reject") {
      if (!viewer.canReview) return NextResponse.json({ error: "Only the Chief Executive Officer can review trade proposals." }, { status: 403 });
      if (typeof body.reviewNote !== "string" || body.reviewNote.trim().length > 5000 || (body.action === "reject" && !body.reviewNote.trim())) return NextResponse.json({ error: "Add a review note (required for rejection, up to 5,000 characters)." }, { status: 400 });
      mutation = supabaseDb.from("trade_proposals").update({ status: body.action === "approve" ? "approved" : "rejected", review_note: body.reviewNote.trim(), reviewer_id: viewer.id, reviewer_name: viewer.name, reviewed_at: now, updated_at: now }).eq("status", "pending");
    } else return NextResponse.json({ error: "Invalid proposal action." }, { status: 400 });
    const { data, error } = await mutation.eq("id", id).eq("updated_at", body.expectedUpdatedAt).select("*").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "This proposal changed, is no longer editable, or is not available to your account. Reload it before trying again." }, { status: 409 });
    if (body.action === "submit") {
      const delivery = await deliverProposalNotification(data);
      return NextResponse.json({ data: mapProposal(delivery.data || data), warning: delivery.warning });
    }
    return NextResponse.json({ data: mapProposal(data) });
  } catch (error) {
    const result = proposalError(error);
    return NextResponse.json(result, { status: result.status });
  }
}
