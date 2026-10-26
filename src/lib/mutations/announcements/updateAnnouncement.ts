"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";
import { getAnnouncementUser } from "@/lib/queries/announcements/getAnnouncementUser";
import { revalidatePath } from "next/cache";

export interface UpdateAnnouncementInput {
  title?: string;
  information?: string;
  isPinned?: boolean;
}

export default async function updateAnnouncement({
  announcementId,
  input,
}: {
  announcementId: string;
  input: UpdateAnnouncementInput;
}) {
  if (!announcementId || !/^[0-9a-fA-F-]{36}$/.test(announcementId)) {
    return {
      message: "Valid announcementId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  if (!input || (input.title === undefined && input.information === undefined && input.isPinned === undefined)) {
    return {
      message: "No fields provided for update",
      error: "At least one field must be provided",
    };
  }

  if ((input.title !== undefined && (typeof input.title !== "string" || !input.title.trim() || input.title.trim().length > 255)) ||
    (input.information !== undefined && (typeof input.information !== "string" || !input.information.trim() || input.information.trim().length > 10000))) {
    return { message: "Invalid announcement", error: "Enter a title (up to 255 characters) and message (up to 10,000 characters)." };
  }

  if (input.isPinned !== undefined && typeof input.isPinned !== "boolean") {
    return { message: "Invalid pin setting", error: "Pinned must be true or false." };
  }

  try {
    const user = await getAnnouncementUser();
    if (!user) return { message: "Unauthorized", error: "Please sign in again." };

    const now = new Date().toISOString();
    const updateData: Record<string, string | boolean> = {
      updated_at: now,
    };

    if (input.title !== undefined) updateData.title = input.title.trim();
    if (input.information !== undefined) updateData.information = input.information.trim();
    if (input.title !== undefined || input.information !== undefined) updateData.edited_at = now;
    if (input.isPinned !== undefined) updateData.is_pinned = input.isPinned;

    const { data: announcement, error } = await supabaseDb
      .from("announcements")
      .update(updateData)
      .eq("id", announcementId)
      .eq("author_id", user.id)
      .is("deleted_at", null)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!announcement) return { message: "Not found", error: "Announcement not found or you are not its author." };

    revalidatePath("/homepage");

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
