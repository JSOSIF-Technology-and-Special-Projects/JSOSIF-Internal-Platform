"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";

export async function getTeam(teamId: string) {
  if (!teamId || !/^[0-9a-fA-F-]{36}$/.test(teamId)) {
    return {
      message: "Valid teamId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  try {
    const { data: team, error } = await supabaseDb
      .from("teams")
      .select(`
        id,
        name,
        description,
        team_type,
        created_at,
        updated_at,
        members (
          id,
          name,
          program,
          year,
          role:roles (
            id,
            name
          )
        ),
        holdings (
          id,
          ticker,
          name,
          industry,
          invest_date,
          divest_date,
          amount_in_shares,
          costCad
        )
      `)
      .eq("id", teamId)
      .maybeSingle();

    if (error) throw error;

    if (!team) {
      return {
        message: "Team not found",
        error: "Team not found",
      };
    }

    const mappedTeam = {
      ...team,
      teamType: (team as any).team_type,
      createdAt: (team as any).created_at,
      updatedAt: (team as any).updated_at,
      members: ((team as any).members || []).map((m: any) => ({
        ...m,
        role: m.role || null,
      })),
      holdings: ((team as any).holdings || []).map((h: any) => ({
        ...h,
        investDate: h.invest_date,
        divestDate: h.divest_date,
        amountInShares: h.amount_in_shares,
        costCad: h.costCad,
      })),
    };

    return {
      message: "Team retrieved successfully",
      data: mappedTeam,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: formatDbError(error),
    };
  }
}
