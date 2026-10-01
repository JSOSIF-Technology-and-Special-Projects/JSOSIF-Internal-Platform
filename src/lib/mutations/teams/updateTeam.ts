"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";

export interface UpdateTeamInput {
  name?: string;
  description?: string;
}

export default async function updateTeam({
  teamId,
  input,
}: {
  teamId: string;
  input: UpdateTeamInput;
}) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!teamId || !/^[0-9a-fA-F-]{36}$/.test(teamId)) {
    return {
      message: "Valid teamId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  if (!input || Object.keys(input).length === 0) {
    return {
      message: "No fields provided for update",
      error: "At least one field must be provided",
    };
  }

  try {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;

    const { data: team, error } = await supabaseDb
      .from("teams")
      .update(updateData)
      .eq("id", teamId)
      .select()
      .single();

    if (error) throw error;

    return {
      message: "Team updated successfully",
      data: {
        ...team,
        teamType: team.team_type,
        createdAt: team.created_at,
        updatedAt: team.updated_at,
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
