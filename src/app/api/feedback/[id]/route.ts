import { NextResponse } from "next/server";
import { supabaseDb } from "@/utils/supabaseDb";
import { feedbackId, isFeedbackStatus } from "@/lib/feedback/types";
import { feedbackFailure, feedbackViewer, mapFeedback } from "@/lib/feedback/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const viewer = await feedbackViewer();
    if (!viewer.isAdmin) return NextResponse.json({ error: "Only admins can change feedback status." }, { status: 403 });
    const { id } = await params;
    if (!feedbackId(id)) return NextResponse.json({ error: "Invalid feedback ID." }, { status: 400 });
    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
    if (!body || typeof body !== "object" || !isFeedbackStatus(body.status) || typeof body.expectedUpdatedAt !== "string" || !Number.isFinite(Date.parse(body.expectedUpdatedAt))) return NextResponse.json({ error: "Choose a valid status and refresh the submission before saving." }, { status: 400 });
    const previous = await supabaseDb.from("feedback_submissions").select("*").eq("id", id).maybeSingle();
    if (previous.error) throw previous.error;
    if (!previous.data) return NextResponse.json({ error: "Feedback submission not found." }, { status: 404 });
    const now = new Date(Math.max(Date.now(), Date.parse(previous.data.updated_at) + 1)).toISOString();
    const { data, error } = await supabaseDb.from("feedback_submissions").update({ status: body.status, reviewed_by: viewer.id, reviewed_by_name: viewer.name, reviewed_at: now, updated_at: now }).eq("id", id).eq("updated_at", body.expectedUpdatedAt).select("*").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Another admin changed this feedback. Refresh the queue before saving." }, { status: 409 });
    return NextResponse.json({ data: mapFeedback(data) });
  } catch (error) {
    const failure = feedbackFailure(error);
    return NextResponse.json(failure, { status: failure.status });
  }
}
