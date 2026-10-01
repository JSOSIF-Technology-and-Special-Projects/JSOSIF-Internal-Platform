"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";

export interface UpdateMemberInput {
  name?: string;
  description?: string;
  program?: string;
  year?: number;
  memberSince?: string | Date;
  linkedin?: string;
  roleId?: string;
  teamId?: string;
}

export default async function updateMember({
  memberId,
  input,
}: {
  memberId: string;
  input: UpdateMemberInput;
}) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!memberId || !/^[0-9a-fA-F-]{36}$/.test(memberId)) {
    return {
      message: "Valid memberId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  if (!input || Object.keys(input).length === 0) {
    return {
      message: "No fields provided for update",
      error: "At least one field must be provided",
    };
  }

  // Validate year range if provided
  if (input.year !== undefined && (input.year < 1 || input.year > 8)) {
    return {
      message: "Year must be between 1 and 8",
      error: "Invalid year value",
    };
  }

  try {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.program !== undefined) updateData.program = input.program;
    if (input.year !== undefined) updateData.year = input.year;
    if (input.memberSince !== undefined) {
      updateData.member_since = new Date(input.memberSince).toISOString().slice(0, 10);
    }
    if (input.linkedin !== undefined) updateData.linkedin = input.linkedin;
    if (input.roleId !== undefined) updateData.role_id = input.roleId || null;
    if (input.teamId !== undefined) updateData.team_id = input.teamId || null;

    const { data: member, error } = await supabaseDb
      .from("members")
      .update(updateData)
      .eq("id", memberId)
      .select("*, role:roles(*), team:teams(*)")
      .single();

    if (error) throw error;

    const mappedMember = {
      ...member,
      memberSince: member.member_since,
      userId: member.user_id,
      roleId: member.role_id,
      teamId: member.team_id,
      createdAt: member.created_at,
      updatedAt: member.updated_at,
      role: member.role || null,
      team: member.team || null,
    };

    return {
      message: "Member updated successfully",
      data: mappedMember,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: formatDbError(error),
    };
  }
}
