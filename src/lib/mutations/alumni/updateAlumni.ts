"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";

export interface UpdateAlumniInput {
  name?: string;
  description?: string;
  companyName?: string;
  industry?: string;
  degree?: string;
  yearsOnFund?: number;
  linkedin?: string;
  formerMemberId?: string;
}

export default async function updateAlumni({
  alumniId,
  input,
}: {
  alumniId: string;
  input: UpdateAlumniInput;
}) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!alumniId || !/^[0-9a-fA-F-]{36}$/.test(alumniId)) {
    return {
      message: "Valid alumniId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  if (!input || Object.keys(input).length === 0) {
    return {
      message: "No fields provided for update",
      error: "At least one field must be provided",
    };
  }

  // Validate non-negative yearsOnFund if provided
  if (input.yearsOnFund !== undefined && input.yearsOnFund < 0) {
    return {
      message: "yearsOnFund must be >= 0",
      error: "Invalid yearsOnFund value",
    };
  }

  if (input.name !== undefined && (typeof input.name !== "string" || !input.name.trim())) {
    return { message: "name is required", error: "Invalid field value" };
  }
  if (input.companyName !== undefined && (typeof input.companyName !== "string" || !input.companyName.trim())) {
    return { message: "companyName is required", error: "Invalid field value" };
  }
  if (input.industry !== undefined && (typeof input.industry !== "string" || !input.industry.trim())) {
    return { message: "industry is required", error: "Invalid field value" };
  }
  if (input.degree !== undefined && (typeof input.degree !== "string" || !input.degree.trim())) {
    return { message: "degree is required", error: "Invalid field value" };
  }
  if (input.yearsOnFund !== undefined && (typeof input.yearsOnFund !== "number" || !Number.isFinite(input.yearsOnFund))) {
    return { message: "Years on fund must be a number", error: "Invalid yearsOnFund value" };
  }

  try {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.companyName !== undefined) updateData.company_name = input.companyName;
    if (input.industry !== undefined) updateData.industry = input.industry;
    if (input.degree !== undefined) updateData.degree = input.degree;
    if (input.yearsOnFund !== undefined) updateData.years_on_fund = input.yearsOnFund;
    if (input.linkedin !== undefined) updateData.linkedin = input.linkedin;
    if (input.formerMemberId !== undefined) updateData.former_member_id = input.formerMemberId || null;

    const { data: alumni, error } = await supabaseDb
      .from("alumni")
      .update(updateData)
      .eq("id", alumniId)
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
      message: "Alumni updated successfully",
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
