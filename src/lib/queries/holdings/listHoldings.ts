"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";

export async function listHoldings() {
  try {
    const { data: rawHoldings, error } = await supabaseDb
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
      .order("name", { ascending: true });

    if (error) throw error;

    const holdings = (rawHoldings || []).map((h: any) => ({
      ...h,
      teamId: h.team_id,
      investDate: h.invest_date,
      divestDate: h.divest_date,
      amountInShares: h.amount_in_shares,
      costCad: h.costCad,
      createdAt: h.created_at,
      updatedAt: h.updated_at,
      team: h.team || null,
    }));

    return {
      message: "List query ran successfully",
      data: holdings,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: formatDbError(error),
    };
  }
}
