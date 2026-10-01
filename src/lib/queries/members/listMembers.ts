"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";

export async function listMembers() {
  try {
    const { data: rawMembers, error } = await supabaseDb
      .from("members")
      .select(`
        id,
        name,
        description,
        program,
        year,
        member_since,
        linkedin,
        user_id,
        role_id,
        team_id,
        created_at,
        updated_at,
        role:roles (
          id,
          name,
          description
        ),
        team:teams (
          id,
          name,
          description
        )
      `)
      .order("name", { ascending: true });

    if (error) throw error;

    const members = (rawMembers || []).map((m: any) => ({
      ...m,
      memberSince: m.member_since,
      userId: m.user_id,
      roleId: m.role_id,
      teamId: m.team_id,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
      role: m.role || null,
      team: m.team || null,
    }));

    return {
      message: "List query ran successfully",
      data: members,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: formatDbError(error),
    };
  }
}
