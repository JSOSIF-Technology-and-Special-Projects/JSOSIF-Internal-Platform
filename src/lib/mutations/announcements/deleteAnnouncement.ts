"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";

export default async function deleteAnnouncement({
  announcementId,
}: {
  announcementId: string;
}) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!announcementId || !/^[0-9a-fA-F-]{36}$/.test(announcementId)) {
    return {
      message: "Valid announcementId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  try {
    const { data: announcement, error } = await supabaseDb
      .from("announcements")
      .delete()
      .eq("id", announcementId)
      .select()
      .single();

    if (error) throw error;

    return {
      message: "Announcement deleted successfully",
      data: announcement,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: formatDbError(error),
    };
  }
}
