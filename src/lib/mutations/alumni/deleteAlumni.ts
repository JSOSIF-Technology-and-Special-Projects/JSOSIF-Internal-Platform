"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";

export default async function deleteAlumni({ alumniId }: { alumniId: string }) {
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

  try {
    const { data: alumni, error } = await supabaseDb
      .from("alumni")
      .delete()
      .eq("id", alumniId)
      .select()
      .single();

    if (error) throw error;

    return {
      message: "Alumni deleted successfully",
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
