"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";

export interface UpdateRoleInput {
  name?: string;
  description?: string;
}

export default async function updateRole({
  roleId,
  input,
}: {
  roleId: string;
  input: UpdateRoleInput;
}) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!roleId) {
    return {
      message: "Role ID is required",
      error: "Role ID is required",
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

    const { data: role, error } = await supabaseDb
      .from("roles")
      .update(updateData)
      .eq("id", roleId)
      .select()
      .single();

    if (error) throw error;

    return {
      message: "Role updated successfully",
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
