"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";

export async function listSupportTeams() {
  try {
    const { data: rawTeams, error } = await supabaseDb
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
          year
        ),
        holdings (
          id,
          ticker,
          name,
          industry
        )
      `)
      .eq("team_type", "Support")
      .order("name", { ascending: true });

    if (error) throw error;

    const supportTeams = (rawTeams || []).map((t: any) => ({
      ...t,
      teamType: t.team_type,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      members: t.members || [],
      holdings: t.holdings || [],
    }));

    return {
      message: "List query ran successfully",
      data: supportTeams,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: formatDbError(error),
    };
  }
}
