"use server";
import { supabaseDb, formatDbError, generateId } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";

export interface CreateInvestmentTeamInput {
  name: string;
  description?: string;
}

export default async function createInvestmentTeam(
  input: CreateInvestmentTeamInput
) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!input.name) {
    return {
      message: "Name is required",
      error: "Missing required fields",
    };
  }

  try {
    const id = generateId();
    const now = new Date().toISOString();
    const { data: team, error } = await supabaseDb
      .from("teams")
      .insert({
        id,
        name: input.name,
        description: input.description || null,
        team_type: "Investment",
        created_at: now,
        updated_at: now,
      })
      .select("*, members(*), holdings(*)")
      .single();

    if (error) throw error;

    return {
      message: "Investment team created successfully",
      data: {
        ...team,
        teamType: team.team_type,
        createdAt: team.created_at,
        updatedAt: team.updated_at,
        members: team.members || [],
        holdings: team.holdings || [],
      },
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: formatDbError(error),
    };
  }
}
