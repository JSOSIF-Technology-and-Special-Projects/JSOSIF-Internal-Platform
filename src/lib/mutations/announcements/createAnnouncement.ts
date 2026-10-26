"use server";
import { supabaseDb, formatDbError, generateId } from "@/utils/supabaseDb";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/utils/permissions";
import { getAnnouncementAuthor } from "@/lib/queries/announcements/getAnnouncementAuthor";

export interface CreateAnnouncementInput {
  title: string;
  information: string;
  isPinned?: boolean;
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
  if (typeof input?.title !== "string" || typeof input?.information !== "string" || !input.title.trim() || !input.information.trim() || input.title.trim().length > 255 || input.information.trim().length > 10000) {
    return {
      message: "Enter a title (up to 255 characters) and message (up to 10,000 characters)",
      error: "Missing required fields",
    };
  }

  if (input.isPinned !== undefined && typeof input.isPinned !== "boolean") {
    return { message: "Invalid pin setting", error: "Pinned must be true or false." };
  }

  try {
    const author = await getAnnouncementAuthor();
    const id = generateId();
    const now = new Date().toISOString();
    const publishedAtStr = input.publishedAt
      ? new Date(input.publishedAt).toISOString()
      : now;

    const { data: announcement, error } = await supabaseDb
      .from("announcements")
      .insert({
        id,
        title: input.title.trim(),
        information: input.information.trim(),
        author_id: author.id,
        author_name: author.name,
        is_pinned: input.isPinned ?? false,
        published_at: publishedAtStr,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/homepage");

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
