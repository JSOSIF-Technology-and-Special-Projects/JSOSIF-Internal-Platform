"use server";
import { supabaseDb, formatDbError, generateId } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";

export interface CreateHoldingInput {
  teamId: string;
  ticker: string;
  name: string;
  description?: string;
  investDate: string | Date;
  divestDate?: string | Date | null;
  amountInShares: number;
  costCad: number | string;
  industry?: string;
}

export default async function createHolding(input: CreateHoldingInput) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  // Validation
  if (
    !input.teamId ||
    !input.ticker ||
    !input.name ||
    !input.investDate ||
    input.amountInShares === undefined ||
    input.costCad === undefined
  ) {
    return {
      message:
        "Missing required field(s) (teamId, ticker, name, investDate, amountInShares, costCad)",
      error: "Missing required fields",
    };
  }

  // Validate non-negative values
  if (input.amountInShares < 0) {
    return {
      message: "amountInShares must be >= 0",
      error: "Invalid amountInShares value",
    };
  }

  const costCadValue =
    typeof input.costCad === "string"
      ? parseFloat(input.costCad)
      : input.costCad;
  if (costCadValue < 0) {
    return {
      message: "costCad must be >= 0",
      error: "Invalid costCad value",
    };
  }

  // Validate divestDate >= investDate if both provided
  if (input.divestDate) {
    const investDate = new Date(input.investDate);
    const divestDate = new Date(input.divestDate);
    if (divestDate < investDate) {
      return {
        message: "divestDate must be >= investDate",
        error: "Invalid date range",
      };
    }
  }

  try {
    const id = generateId();
    const now = new Date().toISOString();
    const investDateStr = new Date(input.investDate).toISOString().slice(0, 10);
    const divestDateStr = input.divestDate ? new Date(input.divestDate).toISOString().slice(0, 10) : null;

    const { data: holding, error } = await supabaseDb
      .from("holdings")
      .insert({
        id,
        team_id: input.teamId,
        ticker: input.ticker,
        name: input.name,
        description: input.description || null,
        invest_date: investDateStr,
        divest_date: divestDateStr,
        amount_in_shares: input.amountInShares,
        costCad: costCadValue,
        industry: input.industry || null,
        created_at: now,
        updated_at: now,
      })
      .select("*, team:teams(*)")
      .single();

    if (error) throw error;

    const mappedHolding = {
      ...holding,
      teamId: holding.team_id,
      investDate: holding.invest_date,
      divestDate: holding.divest_date,
      amountInShares: holding.amount_in_shares,
      costCad: holding.costCad,
      createdAt: holding.created_at,
      updatedAt: holding.updated_at,
      team: holding.team || null,
    };

    return {
      message: "Holding created successfully",
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
