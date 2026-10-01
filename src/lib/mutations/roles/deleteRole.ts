"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";

export default async function deleteRole({ roleId }: { roleId: string }) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!roleId || !/^[0-9a-fA-F-]{36}$/.test(roleId)) {
    return {
      message: "Valid roleId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  try {
    const { data: role, error } = await supabaseDb
      .from("roles")
      .delete()
      .eq("id", roleId)
      .select()
      .single();

    if (error) throw error;

    return {
      message: "Role deleted successfully",
      data: {
        ...role,
        createdAt: role.created_at,
        updatedAt: role.updated_at,
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
