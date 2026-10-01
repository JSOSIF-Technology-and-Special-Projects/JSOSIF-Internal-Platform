"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";

export default async function deleteHolding({
  holdingId,
}: {
  holdingId: string;
}) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!holdingId || !/^[0-9a-fA-F-]{36}$/.test(holdingId)) {
    return {
      message: "Valid holdingId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  try {
    const { data: holding, error } = await supabaseDb
      .from("holdings")
      .delete()
      .eq("id", holdingId)
      .select()
      .single();

    if (error) throw error;

    return {
      message: "Holding deleted successfully",
      data: holding,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: formatDbError(error),
    };
  }
}
