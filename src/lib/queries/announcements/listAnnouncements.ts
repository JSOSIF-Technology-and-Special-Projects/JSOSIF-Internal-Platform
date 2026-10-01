"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";

export async function listAnnouncements() {
  try {
    const { data: rawAnnouncements, error } = await supabaseDb
      .from("announcements")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) throw error;

    const announcements = (rawAnnouncements || []).map((a: any) => ({
      ...a,
      publishedAt: a.published_at,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    }));

    return {
      message: "List query ran successfully",
      data: announcements,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: formatDbError(error),
    };
  }
}
