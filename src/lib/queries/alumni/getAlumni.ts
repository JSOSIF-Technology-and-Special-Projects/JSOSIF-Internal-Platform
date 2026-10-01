"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";

export async function getAlumni(alumniId: string) {
  if (!alumniId || !/^[0-9a-fA-F-]{36}$/.test(alumniId)) {
    return {
      message: "Valid alumniId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  try {
    const { data: alumni, error } = await supabaseDb
      .from("alumni")
      .select(`
        id,
        name,
        description,
        company_name,
        industry,
        degree,
        years_on_fund,
        linkedin,
        former_member_id,
        created_at,
        updated_at,
        formerMember:members!alumni_former_member_id_fkey (
          id,
          name,
          program,
          year,
          member_since,
          team:teams (
            id,
            name
          )
        )
      `)
      .eq("id", alumniId)
      .maybeSingle();

    if (error) throw error;

    if (!alumni) {
      return {
        message: "Alumni not found",
        error: "Alumni not found",
      };
    }

    const formerMember = (alumni as any).formerMember
      ? {
          ...(alumni as any).formerMember,
          memberSince: (alumni as any).formerMember.member_since,
        }
      : null;

    const mappedAlumni = {
      ...alumni,
      companyName: (alumni as any).company_name,
      yearsOnFund: (alumni as any).years_on_fund,
      formerMemberId: (alumni as any).former_member_id,
      createdAt: (alumni as any).created_at,
      updatedAt: (alumni as any).updated_at,
      formerMember,
    };

    return {
      message: "Alumni retrieved successfully",
      data: mappedAlumni,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: formatDbError(error),
    };
  }
}
