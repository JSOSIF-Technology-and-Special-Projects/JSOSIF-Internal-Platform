"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";

export async function getRole(roleId: string) {
  if (!roleId || !/^[0-9a-fA-F-]{36}$/.test(roleId)) {
    return {
      message: "Valid roleId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  try {
    const { data: role, error } = await supabaseDb
      .from("roles")
      .select(`
        id,
        name,
        description,
        created_at,
        updated_at,
        members (
          id,
          name,
          program,
          year
        )
      `)
      .eq("id", roleId)
      .maybeSingle();

    if (error) throw error;

    if (!role) {
      return {
        message: "Role not found",
        error: "Role not found",
      };
    }

    const mappedRole = {
      ...role,
      createdAt: (role as any).created_at,
      updatedAt: (role as any).updated_at,
      members: (role as any).members || [],
    };

    return {
      message: "Role retrieved successfully",
      data: mappedRole,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: formatDbError(error),
    };
  }
}
