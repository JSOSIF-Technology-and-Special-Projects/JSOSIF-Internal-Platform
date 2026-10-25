import { NextResponse } from "next/server";
import { supabaseDb } from "@/utils/supabaseDb";
import { canManageWatchlist, isWatchlistStatus, watchlistFields, watchlistId, watchlistSymbol } from "@/lib/watchlist/types";
import { mapWatchlist, watchlistContext, watchlistFailure } from "@/lib/watchlist/server";
import { watchlistQuote } from "@/lib/watchlist/quotes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  let context;
  try {
    context = await watchlistContext();
    const params = new URL(request.url).searchParams;
    const team = params.get("team") || "my", status = params.get("status") || "active", search = (params.get("search") || "").trim();
    const page = Number(params.get("page") || 1);
    if ((team !== "all" && team !== "my" && !watchlistId(team)) || (status !== "all" && status !== "active" && !isWatchlistStatus(status)) || !Number.isInteger(page) || page < 1 || page > 10000 || search.length > 80 || !/^[\p{L}\p{N} .&'-]*$/u.test(search)) return NextResponse.json({ error: "Invalid watchlist filter or search. Search by company name or ticker." }, { status: 400 });
    const teamId = team === "my" ? context.viewer.teamId : team === "all" ? null : team;
    if (teamId && !context.teams.some(item => item.id === teamId)) return NextResponse.json({ error: "Investment team not found." }, { status: 404 });
    let query = supabaseDb.from("watchlist_entries").select("*");
    if (teamId) query = query.eq("team_id", teamId);
    if (status === "active") query = query.neq("status", "archived");
    else if (status !== "all") query = query.eq("status", status);
    if (search) query = query.or(`symbol.ilike.%${search}%,company_name.ilike.%${search}%,sector.ilike.%${search}%`);
    const { data, error } = await query.order("updated_at", { ascending: false }).order("id", { ascending: true }).range((page - 1) * 10, page * 10);
    if (error) throw error;
    return NextResponse.json({ ...context, data: (data || []).slice(0, 10).map(mapWatchlist), hasMore: (data?.length || 0) > 10, page });
  } catch (error) {
    const failure = watchlistFailure(error);
    return NextResponse.json({ ...context, ...failure }, { status: failure.status });
  }
}
export async function POST(request: Request) {
  try {
    const { viewer, teams } = await watchlistContext();
    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
    if (!body || typeof body !== "object" || !watchlistId(body.id) || !watchlistId(body.teamId) || !watchlistSymbol(body.symbol)) return NextResponse.json({ error: "Choose a team and enter a valid ticker." }, { status: 400 });
    if (!canManageWatchlist(viewer, body.teamId)) return NextResponse.json({ error: "You can add entries only to your investment team’s watchlist." }, { status: 403 });
    if (!teams.some(team => team.id === body.teamId)) return NextResponse.json({ error: "Choose an investment team." }, { status: 400 });
    const fields = watchlistFields(body);
    if ("error" in fields) return NextResponse.json(fields, { status: 400 });
    let quote;
    try { quote = await watchlistQuote(body.symbol); } catch { return NextResponse.json({ error: "Unable to verify this CAD/USD stock or ETF. Check its ticker and try again; prices may be temporarily unavailable." }, { status: 422 }); }
    const now = new Date().toISOString();
    const payload = { id: body.id, team_id: body.teamId, symbol: quote.symbol, company_name: quote.name, sector: fields.data.sector || quote.sector || teams.find(team => team.id === body.teamId)!.name.slice(0, 120), notes: fields.data.notes, target_price_cad: fields.data.targetPriceCad, status: fields.data.status, author_id: viewer.id, author_name: viewer.name, updated_by: viewer.id, updated_by_name: viewer.name, created_at: now, updated_at: now };
    const { data, error } = await supabaseDb.from("watchlist_entries").insert(payload).select("*").single();
    if (error?.code === "23505") {
      const existing = await supabaseDb.from("watchlist_entries").select("*").eq("id", body.id).maybeSingle();
      if (existing.error) throw existing.error;
      const row = existing.data;
      if (row && row.author_id === viewer.id && row.team_id === body.teamId && row.symbol === quote.symbol && row.notes === payload.notes && row.sector === payload.sector && row.status === payload.status && (row.target_price_cad === null ? null : Number(row.target_price_cad)) === payload.target_price_cad) return NextResponse.json({ data: mapWatchlist(row) });
      return NextResponse.json({ error: "This ticker is already on the team’s watchlist. Check active and archived entries before adding it again." }, { status: 409 });
    }
    if (error) throw error;
    return NextResponse.json({ data: mapWatchlist(data) }, { status: 201 });
  } catch (error) {
    const failure = watchlistFailure(error);
    return NextResponse.json(failure, { status: failure.status });
  }
}
