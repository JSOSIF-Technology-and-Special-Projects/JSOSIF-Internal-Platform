"use server";
import { supabaseDb, formatDbError, generateId } from "@/utils/supabaseDb";
import { requireAdmin } from "@/utils/permissions";

export interface CreateAnnouncementInput {
  title: string;
  information: string;
  publishedAt?: string | Date;
}

export default async function createAnnouncement(
  input: CreateAnnouncementInput
) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  // Validation
  if (!input.title || !input.information) {
    return {
      message: "Missing required field(s) (title, information)",
      error: "Missing required fields",
    };
  }

  try {
    const id = generateId();
    const now = new Date().toISOString();
    const publishedAtStr = input.publishedAt
      ? new Date(input.publishedAt).toISOString()
      : now;

    const { data: announcement, error } = await supabaseDb
      .from("announcements")
      .insert({
        id,
        title: input.title,
        information: input.information,
        published_at: publishedAtStr,
        created_at: now,
        updated_at: now,
      })
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
      message: "Announcement created successfully",
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
