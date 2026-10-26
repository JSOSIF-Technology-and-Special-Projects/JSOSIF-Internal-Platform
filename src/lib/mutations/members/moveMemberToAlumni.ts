"use server";

import { supabaseDb, formatDbError } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";
import { revalidatePath } from "next/cache";

export interface MoveMemberToAlumniInput {
  degree: string;
  yearsOnFund: number;
  companyName?: string;
  industry?: string;
}

export default async function moveMemberToAlumni({ memberId, input }: { memberId: string; input: MoveMemberToAlumniInput }) {
  const authError = await requireAdmin();
  if (authError) return { ...authError, status: 403 };

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memberId)) {
    return { message: "Invalid member", error: "A valid member ID is required.", status: 400 };
  }
  if (!input || typeof input.degree !== "string" || !input.degree.trim() || input.degree.trim().length > 255 ||
    !Number.isInteger(input.yearsOnFund) || input.yearsOnFund < 0 || input.yearsOnFund > 2147483647) {
    return { message: "Invalid alumni details", error: "Enter a degree (up to 255 characters) and a non-negative whole number of years on the fund.", status: 400 };
  }
  for (const field of ["companyName", "industry"] as const) {
    if (input[field] !== undefined && (typeof input[field] !== "string" || input[field].trim().length > 255)) {
      return { message: "Invalid alumni details", error: "Company and industry must be text of up to 255 characters.", status: 400 };
    }
  }

  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { message: "Setup required", error: "The server is missing its Supabase service-role key. Configure it in the server environment and restart the app.", status: 503 };
    }
    // The database function locks the member and performs both writes atomically.
    const { data, error } = await supabaseDb.rpc("move_member_to_alumni", {
      p_member_id: memberId,
      p_degree: input.degree.trim(),
      p_years_on_fund: input.yearsOnFund,
      p_company_name: input.companyName?.trim() || "",
      p_industry: input.industry?.trim() || "",
    });
    if (error) {
      if (error.code === "42501") {
        return { message: "Setup required", error: "The server’s Supabase key cannot run the alumni transfer. Verify that its service-role key is configured correctly.", status: 503 };
      }
      if (error.code === "PGRST202" || error.code === "42703") {
        return { message: "Setup required", error: "Moving members to alumni has not been configured yet.", status: 503 };
      }
      if (error.code === "P0002") return { message: "Not found", error: "Member not found.", status: 404 };
      if (error.code === "23505") return { message: "Duplicate alumni", error: "An alumni record already uses this member’s LinkedIn URL. Review that record before moving this member.", status: 409 };
      throw error;
    }
    revalidatePath("/admin-dashboard/members");
    revalidatePath("/admin-dashboard/alumni");
    revalidatePath("/teams");
    return { message: "Member moved to alumni successfully.", data, status: 200 };
  } catch (error) {
    console.error("Move to alumni failed:", error);
    return { message: "Unable to move member to alumni", error: formatDbError(error), status: 500 };
  }
}
