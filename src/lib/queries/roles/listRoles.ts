"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";

export async function listRoles() {
  try {
    const { data: rawRoles, error } = await supabaseDb
      .from("roles")
      .select(`
        id,
        name,
        description,
        created_at,
        updated_at,
        members (
          id,
          name
        )
      `)
      .order("name", { ascending: true });

    if (error) throw error;

    const roles = (rawRoles || []).map((r: any) => ({
      ...r,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      members: r.members || [],
    }));

    return {
      message: "List query ran successfully",
      data: roles,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: formatDbError(error),
    };
  }
}
