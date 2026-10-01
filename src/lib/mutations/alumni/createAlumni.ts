"use server";
import { supabaseDb, formatDbError, generateId } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";

export interface CreateAlumniInput {
  name: string;
  description?: string;
  companyName: string;
  industry: string;
  degree: string;
  yearsOnFund: number;
  linkedin?: string;
  formerMemberId?: string;
}

export default async function createAlumni(input: CreateAlumniInput) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  // Validation
  if (
    !input.name ||
    !input.companyName ||
    !input.industry ||
    !input.degree ||
    input.yearsOnFund === undefined
  ) {
    return {
      message:
        "Missing required field(s) (name, companyName, industry, degree, yearsOnFund)",
      error: "Missing required fields",
    };
  }

  // Validate non-negative yearsOnFund
  if (input.yearsOnFund < 0) {
    return {
      message: "yearsOnFund must be >= 0",
      error: "Invalid yearsOnFund value",
    };
  }

  try {
    const id = generateId();
    const now = new Date().toISOString();

    const { data: alumni, error } = await supabaseDb
      .from("alumni")
      .insert({
        id,
        name: input.name,
        description: input.description || null,
        company_name: input.companyName,
        industry: input.industry,
        degree: input.degree,
        years_on_fund: input.yearsOnFund,
        linkedin: input.linkedin || null,
        former_member_id: input.formerMemberId || null,
        created_at: now,
        updated_at: now,
      })
      .select("*, formerMember:members!alumni_former_member_id_fkey(*)")
      .single();

    if (error) throw error;

    const mappedAlumni = {
      ...alumni,
      companyName: alumni.company_name,
      yearsOnFund: alumni.years_on_fund,
      formerMemberId: alumni.former_member_id,
      createdAt: alumni.created_at,
      updatedAt: alumni.updated_at,
      formerMember: alumni.formerMember || null,
    };

    return {
      message: "Alumni created successfully",
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
