"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";

export interface UpdateAnnouncementInput {
  title?: string;
  information?: string;
  publishedAt?: string | Date;
}

export default async function updateAnnouncement({
  announcementId,
  input,
}: {
  announcementId: string;
  input: UpdateAnnouncementInput;
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

  if (!input || Object.keys(input).length === 0) {
    return {
      message: "No fields provided for update",
      error: "At least one field must be provided",
    };
  }

  try {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.information !== undefined) updateData.information = input.information;
    if (input.publishedAt !== undefined) {
      updateData.published_at = new Date(input.publishedAt).toISOString();
    }

    const { data: announcement, error } = await supabaseDb
      .from("announcements")
      .update(updateData)
      .eq("id", announcementId)
      .select()
      .single();

    if (error) throw error;

    const mapped = {
      ...announcement,
      publishedAt: announcement.published_at,
      createdAt: announcement.created_at,
      updatedAt: announcement.updated_at,
    };

    return {
      message: "Announcement updated successfully",
      data: mapped,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: formatDbError(error),
    };
  }
}
