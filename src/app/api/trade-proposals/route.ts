import { NextResponse } from "next/server";
import { supabaseDb } from "@/utils/supabaseDb";
import { isProposalStatus, parseProposalDraft } from "@/lib/trades/proposals";
import { getProposalViewer, mapProposal, proposalError, visibleProposals } from "@/lib/trades/server";

export async function GET(request: Request) {
  try {
    const viewer = await getProposalViewer();
    if (!viewer) return NextResponse.json({ error: "Please sign in to view proposals." }, { status: 401 });
    const query = new URL(request.url).searchParams;
    const filter = query.get("status") || "all";
    const page = Number(query.get("page") || 1);
    if ((filter !== "all" && !isProposalStatus(filter)) || !Number.isInteger(page) || page < 1 || page > 10000) return NextResponse.json({ error: "Invalid proposal filter or page." }, { status: 400 });
    let records = visibleProposals(viewer);
    if (filter !== "all") records = records.eq("status", filter);
    const { data, error } = await records.order("created_at", { ascending: false }).order("id", { ascending: true }).range((page - 1) * 10, page * 10);
    if (error) throw error;
    return NextResponse.json({ data: (data || []).slice(0, 10).map(mapProposal), hasMore: (data?.length || 0) > 10, page, viewer });
  } catch (error) {
    const result = proposalError(error);
    return NextResponse.json(result, { status: result.status });
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await getProposalViewer();
    if (!viewer) return NextResponse.json({ error: "Please sign in before creating a proposal." }, { status: 401 });
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: "Trade submissions need the server’s Supabase key to be configured." }, { status: 503 });
    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
    const parsed = parseProposalDraft(body);
    if ("error" in parsed) return NextResponse.json(parsed, { status: 400 });
    const now = new Date().toISOString();
    const { data, error } = await supabaseDb.from("trade_proposals").insert({ id: parsed.data.id, author_id: viewer.id, author_name: viewer.name, status: "draft", legs: parsed.data.legs, simulation: parsed.data.simulation, reason: "", created_at: now, updated_at: now }).select("*").single();
    if (error?.code === "23505") {
      const existing = await supabaseDb.from("trade_proposals").select("*").eq("id", parsed.data.id).eq("author_id", viewer.id).maybeSingle();
      if (existing.error) throw existing.error;
      if (existing.data) return NextResponse.json({ data: mapProposal(existing.data) });
      return NextResponse.json({ error: "Unable to create this proposal. Please try again." }, { status: 409 });
    }
    if (error) throw error;
    return NextResponse.json({ data: mapProposal(data) }, { status: 201 });
  } catch (error) {
    const result = proposalError(error);
    return NextResponse.json(result, { status: result.status });
  }
}
