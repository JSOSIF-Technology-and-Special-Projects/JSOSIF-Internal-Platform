"use server";
import { supabaseDb, formatDbError, generateId } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";

export interface CreateSupportTeamInput {
  name: string;
  description?: string;
}

export default async function createSupportTeam(input: CreateSupportTeamInput) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  // Validation
  if (!input.name) {
    return {
      message: "Missing required field: name",
      error: "Missing required fields",
    };
  }

  try {
    const id = generateId();
    const now = new Date().toISOString();
    const { data: supportTeam, error } = await supabaseDb
      .from("teams")
      .insert({
        id,
        name: input.name,
        description: input.description || null,
        team_type: "Support",
        created_at: now,
        updated_at: now,
      })
      .select("*, members(*), holdings(*)")
      .single();

    if (error) throw error;

    return {
      message: "Support team created successfully",
      data: {
        ...supportTeam,
        teamType: supportTeam.team_type,
        createdAt: supportTeam.created_at,
        updatedAt: supportTeam.updated_at,
        members: supportTeam.members || [],
        holdings: supportTeam.holdings || [],
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
