"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";

export async function getAnnouncement(announcementId: string) {
  if (!announcementId || !/^[0-9a-fA-F-]{36}$/.test(announcementId)) {
    return {
      message: "Valid announcementId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  try {
    const { data: announcement, error } = await supabaseDb
      .from("announcements")
      .select("*")
      .eq("id", announcementId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw error;

    if (!announcement) {
      return {
        message: "Announcement not found",
        error: "Announcement not found",
      };
    }

    const mappedAnnouncement = {
      ...announcement,
      publishedAt: announcement.published_at,
      createdAt: announcement.created_at,
      updatedAt: announcement.updated_at,
    };

    return {
      message: "Announcement retrieved successfully",
      data: mappedAnnouncement,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: formatDbError(error),
    };
  }
}
