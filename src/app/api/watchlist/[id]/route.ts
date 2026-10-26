import { NextResponse } from "next/server";
import { supabaseDb } from "@/utils/supabaseDb";
import { canManageWatchlist, watchlistFields, watchlistId } from "@/lib/watchlist/types";
import { mapWatchlist, watchlistContext, watchlistFailure } from "@/lib/watchlist/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { viewer } = await watchlistContext();
    const { id } = await params;
    if (!watchlistId(id)) return NextResponse.json({ error: "Invalid watchlist entry ID." }, { status: 400 });
    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
    const fields = watchlistFields(body);
    if ("error" in fields) return NextResponse.json(fields, { status: 400 });
    if (typeof body.expectedUpdatedAt !== "string" || !Number.isFinite(Date.parse(body.expectedUpdatedAt))) return NextResponse.json({ error: "Reload the watchlist before saving." }, { status: 400 });
    const previous = await supabaseDb.from("watchlist_entries").select("*").eq("id", id).maybeSingle();
    if (previous.error) throw previous.error;
    if (!previous.data) return NextResponse.json({ error: "Watchlist entry not found." }, { status: 404 });
    if (!canManageWatchlist(viewer, previous.data.team_id)) return NextResponse.json({ error: "Only this investment team’s members or an admin can manage this entry." }, { status: 403 });
    const updatedAt = new Date(Math.max(Date.now(), Date.parse(previous.data.updated_at) + 1)).toISOString();
    const { data, error } = await supabaseDb.from("watchlist_entries").update({ notes: fields.data.notes, target_price_cad: fields.data.targetPriceCad, status: fields.data.status, ...(fields.data.sector !== undefined ? { sector: fields.data.sector } : {}), updated_by: viewer.id, updated_by_name: viewer.name, updated_at: updatedAt }).eq("id", id).eq("team_id", previous.data.team_id).eq("updated_at", body.expectedUpdatedAt).select("*").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Another team member changed this entry. Refresh the watchlist before saving your changes." }, { status: 409 });
    return NextResponse.json({ data: mapWatchlist(data) });
  } catch (error) {
    const failure = watchlistFailure(error);
    return NextResponse.json(failure, { status: failure.status });
  }
}
