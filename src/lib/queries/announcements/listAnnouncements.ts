"use server";
import { supabaseDb, formatDbError } from "@/utils/supabaseDb";

const PAGE_SIZE = 10;

export async function listAnnouncements(requestedPage = 1) {
  const page = Number.isInteger(requestedPage) && requestedPage >= 1 && requestedPage <= 10000 ? requestedPage : 1;
  const offset = (page - 1) * PAGE_SIZE;
  try {
    const active = () => supabaseDb.from("announcements").select("*").is("deleted_at", null);
    const [pinned, recent] = await Promise.all([
      active().eq("is_pinned", true).order("published_at", { ascending: false }).order("id", { ascending: true }),
      active().eq("is_pinned", false).order("published_at", { ascending: false }).order("id", { ascending: true }).range(offset, offset + PAGE_SIZE),
    ]);
    if (pinned.error) throw pinned.error;
    if (recent.error) throw recent.error;

    const announcements = [...(pinned.data || []), ...(recent.data || []).slice(0, PAGE_SIZE)].map((a) => ({
      ...a,
      publishedAt: a.published_at,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    }));

    return {
      message: "List query ran successfully",
      data: announcements,
      page,
      hasMore: (recent.data?.length || 0) > PAGE_SIZE,
    };
  } catch (error) {
    console.error("Database error:", error);
    return { message: "Database error", error: formatDbError(error) };
  }
}
