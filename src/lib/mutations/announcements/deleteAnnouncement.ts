"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";
import { getAnnouncementUser } from "@/lib/queries/announcements/getAnnouncementUser";
import { revalidatePath } from "next/cache";

export default async function deleteAnnouncement({
  announcementId,
}: {
  announcementId: string;
}) {
  if (!announcementId || !/^[0-9a-fA-F-]{36}$/.test(announcementId)) {
    return {
      message: "Valid announcementId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  try {
    const user = await getAnnouncementUser();
    if (!user) return { message: "Unauthorized", error: "Please sign in again." };

    const now = new Date().toISOString();
    const { data: announcement, error } = await supabaseDb
      .from("announcements")
      .update({ deleted_at: now, updated_at: now })
      .eq("id", announcementId)
      .eq("author_id", user.id)
      .is("deleted_at", null)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!announcement) return { message: "Not found", error: "Announcement not found or you are not its author." };

    revalidatePath("/homepage");

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
