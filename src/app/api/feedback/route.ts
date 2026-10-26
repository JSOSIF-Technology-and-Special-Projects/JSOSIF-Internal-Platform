import { NextResponse } from "next/server";
import { supabaseDb } from "@/utils/supabaseDb";
import { feedbackFields, feedbackId, isFeedbackKind, isFeedbackStatus } from "@/lib/feedback/types";
import { feedbackFailure, feedbackViewer, mapFeedback } from "@/lib/feedback/server";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  let viewer;
  try {
    viewer = await feedbackViewer();
    const params = new URL(request.url).searchParams;
    const scope = params.get("scope") || "mine", kind = params.get("kind") || "all", status = params.get("status") || "all";
    const page = Number(params.get("page") || 1);
    if (!["mine", "all"].includes(scope) || (kind !== "all" && !isFeedbackKind(kind)) || (status !== "all" && !isFeedbackStatus(status)) || !Number.isInteger(page) || page < 1 || page > 10000) return NextResponse.json({ viewer, error: "Invalid feedback filter or page." }, { status: 400 });
    if (scope === "all" && !viewer.isAdmin) return NextResponse.json({ viewer, error: "Only admins can review everyone’s feedback." }, { status: 403 });
    let query = supabaseDb.from("feedback_submissions").select("*");
    if (scope === "mine") query = query.eq("author_id", viewer.id);
    if (kind !== "all") query = query.eq("kind", kind);
    if (status !== "all") query = query.eq("status", status);
    const { data, error } = await query.order("created_at", { ascending: false }).order("id", { ascending: true }).range((page - 1) * 10, page * 10);
    if (error) throw error;
    return NextResponse.json({ viewer, data: (data || []).slice(0, 10).map(mapFeedback), hasMore: (data?.length || 0) > 10, page });
  } catch (error) {
    const failure = feedbackFailure(error);
    return NextResponse.json({ viewer, ...failure }, { status: failure.status });
  }
}
export async function POST(request: Request) {
  try {
    const viewer = await feedbackViewer();
    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
    const fields = feedbackFields(body);
    if ("error" in fields) return NextResponse.json(fields, { status: 400 });
    if (!feedbackId(body.id)) return NextResponse.json({ error: "Refresh the page before submitting feedback." }, { status: 400 });
    const now = new Date().toISOString();
    const payload = { id: body.id, author_id: viewer.id, author_name: viewer.name, kind: fields.data.kind, message: fields.data.message, page_path: fields.data.pagePath, status: "new", created_at: now, updated_at: now };
    const { data, error } = await supabaseDb.from("feedback_submissions").insert(payload).select("*").single();
    if (error?.code === "23505") {
      const existing = await supabaseDb.from("feedback_submissions").select("*").eq("id", body.id).eq("author_id", viewer.id).maybeSingle();
      if (existing.error) throw existing.error;
      const row = existing.data;
      if (row && row.kind === payload.kind && row.message === payload.message && row.page_path === payload.page_path) return NextResponse.json({ data: mapFeedback(row) });
      return NextResponse.json({ error: "This feedback could not be submitted. Refresh and try again." }, { status: 409 });
    }
    if (error) throw error;
    return NextResponse.json({ data: mapFeedback(data) }, { status: 201 });
  } catch (error) {
    const failure = feedbackFailure(error);
    return NextResponse.json(failure, { status: failure.status });
  }
}
