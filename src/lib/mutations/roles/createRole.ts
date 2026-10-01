"use server";
import { supabaseDb, formatDbError, generateId } from "@/utils/supabaseDb";

export interface CreateRoleInput {
  name: string;
  description?: string;
}

export default async function createRole(input: CreateRoleInput) {
  if (!input.name) {
    return {
      message: "Missing required field: name",
      error: "Name is required",
    };
  }

  try {
    const id = generateId();
    const now = new Date().toISOString();
    const { data: role, error } = await supabaseDb
      .from("roles")
      .insert({
        id,
        name: input.name,
        description: input.description || null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      message: "Role created successfully",
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
