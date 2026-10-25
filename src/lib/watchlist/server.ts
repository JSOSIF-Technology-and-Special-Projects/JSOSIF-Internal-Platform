import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { supabaseDb } from "@/utils/supabaseDb";
import type { WatchlistEntry, WatchlistStatus, WatchlistTeam, WatchlistViewer } from "./types";

export class WatchlistError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export async function watchlistUser() {
  const client = createClient(await cookies());
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new WatchlistError("Please sign in to use watchlists.", 401);
  return user;
}
export async function watchlistContext() {
  const user = await watchlistUser();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new WatchlistError("Watchlists are not available yet. An administrator needs to complete setup.", 503);
  const [member, profile, teamsResult] = await Promise.all([
    supabaseDb.from("members").select("name, team_id, role:roles(name)").eq("user_id", user.id).is("graduated_at", null).maybeSingle(),
    supabaseDb.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    supabaseDb.from("teams").select("id, name").eq("team_type", "Investment").order("name"),
  ]);
  if (member.error || profile.error || teamsResult.error) throw new WatchlistError("Unable to verify your team or permissions. Please try again.", 503);
  const teams: WatchlistTeam[] = teamsResult.data || [];
  const role = Array.isArray(member.data?.role) ? member.data.role[0] : member.data?.role;
  const isAdmin = [profile.data?.role, role?.name].some(value => typeof value === "string" && value.toLowerCase() === "admin");
  const metadataName = user.user_metadata?.full_name || user.user_metadata?.name;
  const name = String(member.data?.name || (typeof metadataName === "string" ? metadataName : null) || user.email || "Member").trim().slice(0, 255);
  const viewer: WatchlistViewer = { id: user.id, name, isAdmin, teamId: teams.some(team => team.id === member.data?.team_id) ? member.data!.team_id : null };
  return { viewer, teams };
}
export interface WatchlistRow {
  id: string; team_id: string; symbol: string; company_name: string; sector: string;
  notes: string; target_price_cad: number | string | null; status: WatchlistStatus;
  author_id: string; author_name: string; updated_by_name: string; created_at: string; updated_at: string;
}
export function mapWatchlist(row: WatchlistRow): WatchlistEntry {
  return { id: row.id, teamId: row.team_id, symbol: row.symbol, companyName: row.company_name, sector: row.sector, notes: row.notes, targetPriceCad: row.target_price_cad === null ? null : Number(row.target_price_cad), status: row.status, authorId: row.author_id, authorName: row.author_name, updatedByName: row.updated_by_name, createdAt: row.created_at, updatedAt: row.updated_at };
}
export function watchlistFailure(error: unknown) {
  if (error instanceof WatchlistError) return { error: error.message, status: error.status };
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "unknown";
  if (["42P01", "42703", "42501", "PGRST204", "PGRST205"].includes(code)) return { error: "Watchlists are not available yet. An administrator needs to complete setup.", status: 503, setupRequired: true };
  console.error("Watchlist request failed:", code);
  return { error: "Unable to save or load the watchlist. Please try again.", status: 500 };
}
