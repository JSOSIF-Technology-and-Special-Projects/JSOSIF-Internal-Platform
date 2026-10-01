"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";

export async function listAlumni() {
  try {
    const { data: rawAlumni, error } = await supabaseDb
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
          program
        )
      `)
      .order("name", { ascending: true });

    if (error) throw error;

    const alumni = (rawAlumni || []).map((a: any) => ({
      ...a,
      companyName: a.company_name,
      yearsOnFund: a.years_on_fund,
      formerMemberId: a.former_member_id,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
      formerMember: a.formerMember || null,
    }));

    return {
      message: "List query ran successfully",
      data: alumni,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: formatDbError(error),
    };
  }
}
