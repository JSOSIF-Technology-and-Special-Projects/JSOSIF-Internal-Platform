"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";

export async function getHolding(holdingId: string) {
  if (!holdingId || !/^[0-9a-fA-F-]{36}$/.test(holdingId)) {
    return {
      message: "Valid holdingId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  try {
    const { data: holding, error } = await supabaseDb
      .from("holdings")
      .select(`
        id,
        team_id,
        ticker,
        name,
        description,
        invest_date,
        divest_date,
        amount_in_shares,
        costCad,
        industry,
        created_at,
        updated_at,
        team:teams (
          id,
          name,
          description
        )
      `)
      .eq("id", holdingId)
      .maybeSingle();

    if (error) throw error;

    if (!holding) {
      return {
        message: "Holding not found",
        error: "Holding not found",
      };
    }

    const mappedHolding = {
      ...holding,
      teamId: (holding as any).team_id,
      investDate: (holding as any).invest_date,
      divestDate: (holding as any).divest_date,
      amountInShares: (holding as any).amount_in_shares,
      costCad: (holding as any).costCad,
      createdAt: (holding as any).created_at,
      updatedAt: (holding as any).updated_at,
      team: (holding as any).team || null,
    };

    return {
      message: "Holding retrieved successfully",
      data: mappedHolding,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: formatDbError(error),
    };
  }
}
