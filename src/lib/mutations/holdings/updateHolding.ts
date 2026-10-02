"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";

export interface UpdateHoldingInput {
  teamId?: string;
  ticker?: string;
  name?: string;
  description?: string;
  investDate?: string | Date;
  divestDate?: string | Date | null;
  amountInShares?: number;
  costCad?: number | string;
  industry?: string;
}

export default async function updateHolding({
  holdingId,
  input,
}: {
  holdingId: string;
  input: UpdateHoldingInput;
}) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!holdingId || !/^[0-9a-fA-F-]{36}$/.test(holdingId)) {
    return {
      message: "Valid holdingId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  if (!input || Object.keys(input).length === 0) {
    return {
      message: "No fields provided for update",
      error: "At least one field must be provided",
    };
  }

  // Validate non-negative values if provided
  if (input.amountInShares !== undefined && input.amountInShares < 0) {
    return {
      message: "amountInShares must be >= 0",
      error: "Invalid amountInShares value",
    };
  }

  if (input.costCad !== undefined) {
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
  }

  // Validate date range if both dates are being updated
  if (input.investDate && input.divestDate !== undefined) {
    const investDate = new Date(input.investDate);
    const divestDate = input.divestDate ? new Date(input.divestDate) : null;
    if (divestDate && divestDate < investDate) {
      return {
        message: "divestDate must be >= investDate",
        error: "Invalid date range",
      };
    }
  }

  if (input.name !== undefined && (typeof input.name !== "string" || !input.name.trim())) {
    return { message: "name is required", error: "Invalid field value" };
  }
  if (input.ticker !== undefined && (typeof input.ticker !== "string" || !input.ticker.trim())) {
    return { message: "ticker is required", error: "Invalid field value" };
  }
  if (input.teamId !== undefined && (typeof input.teamId !== "string" || !input.teamId.trim())) {
    return { message: "teamId is required", error: "Invalid field value" };
  }
  if (input.amountInShares !== undefined && (typeof input.amountInShares !== "number" || !Number.isFinite(input.amountInShares))) {
    return { message: "Shares must be a number", error: "Invalid amountInShares value" };
  }
  if (input.costCad !== undefined && (input.costCad === null || input.costCad === "" || !Number.isFinite(Number(input.costCad)))) {
    return { message: "Cost must be a number", error: "Invalid costCad value" };
  }
  if (input.investDate !== undefined && (!input.investDate || Number.isNaN(new Date(input.investDate).getTime()))) {
    return { message: "A valid investment date is required", error: "Invalid date" };
  }

  try {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (input.teamId !== undefined) updateData.team_id = input.teamId;
    if (input.ticker !== undefined) updateData.ticker = input.ticker;
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.investDate !== undefined) {
      updateData.invest_date = new Date(input.investDate).toISOString().slice(0, 10);
    }
    if (input.divestDate !== undefined) {
      updateData.divest_date = input.divestDate ? new Date(input.divestDate).toISOString().slice(0, 10) : null;
    }
    if (input.amountInShares !== undefined) updateData.amount_in_shares = input.amountInShares;
    if (input.costCad !== undefined) {
      updateData.costCad = typeof input.costCad === "string" ? parseFloat(input.costCad) : input.costCad;
    }
    if (input.industry !== undefined) updateData.industry = input.industry;

    const { data: holding, error } = await supabaseDb
      .from("holdings")
      .update(updateData)
      .eq("id", holdingId)
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
      message: "Holding updated successfully",
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
