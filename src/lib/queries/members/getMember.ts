"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";

export async function getMember(memberId: string) {
  if (!memberId || !/^[0-9a-fA-F-]{36}$/.test(memberId)) {
    return {
      message: "Valid memberId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  try {
    const { data: member, error } = await supabaseDb
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
        ),
        alumni (
          id,
          name,
          company_name
        )
      `)
      .eq("id", memberId)
      .maybeSingle();

    if (error) throw error;

    if (!member) {
      return {
        message: "Member not found",
        error: "Member not found",
      };
    }

    const mappedMember = {
      ...member,
      memberSince: (member as any).member_since,
      userId: (member as any).user_id,
      roleId: (member as any).role_id,
      teamId: (member as any).team_id,
      createdAt: (member as any).created_at,
      updatedAt: (member as any).updated_at,
      role: (member as any).role || null,
      team: (member as any).team || null,
      alumni: ((member as any).alumni || []).map((a: any) => ({
        ...a,
        companyName: a.company_name,
      })),
    };

    return {
      message: "Member retrieved successfully",
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
