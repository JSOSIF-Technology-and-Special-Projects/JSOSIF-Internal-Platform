"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";

export default async function deleteMember({ memberId }: { memberId: string }) {
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

  try {
    const { data: member, error } = await supabaseDb
      .from("members")
      .delete()
      .eq("id", memberId)
      .select()
      .single();

    if (error) throw error;

    return {
      message: "Member deleted successfully",
      data: member,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: formatDbError(error),
    };
  }
}
