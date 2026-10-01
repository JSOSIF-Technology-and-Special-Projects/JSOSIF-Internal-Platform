"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";

export default async function deleteTeam({ teamId }: { teamId: string }) {
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

  try {
    const { data: team, error } = await supabaseDb
      .from("teams")
      .delete()
      .eq("id", teamId)
      .select()
      .single();

    if (error) throw error;

    return {
      message: "Team deleted successfully",
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
