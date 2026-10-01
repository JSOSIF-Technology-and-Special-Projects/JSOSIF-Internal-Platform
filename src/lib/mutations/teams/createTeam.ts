"use server";
import { supabaseDb, formatDbError, generateId } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";

export interface CreateTeamInput {
  name: string;
  description?: string;
  teamType: string;
}

export default async function createTeam(input: CreateTeamInput) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!input.name || !input.teamType) {
    return {
      message: "Name and teamType are required",
      error: "Missing required fields",
    };
  }

  // Validate teamType
  if (!["Investment", "Support"].includes(input.teamType)) {
    return {
      message: "teamType must be either 'Investment' or 'Support'",
      error: "Invalid teamType value",
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
        team_type: input.teamType,
        created_at: now,
        updated_at: now,
      })
      .select("*, members(*), holdings(*)")
      .single();

    if (error) throw error;

    return {
      message: "Team created successfully",
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
