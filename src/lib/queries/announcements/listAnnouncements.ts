"use server";
import { prisma } from "@/utils/prisma";

export async function listAnnouncements() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: {
        publishedAt: "desc",
      },
    });

    return {
      message: "List query ran successfully",
      data: announcements,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
