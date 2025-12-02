"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function getAnnouncement(announcementId: string) {
  if (!announcementId || !/^[0-9a-fA-F-]{36}$/.test(announcementId)) {
    return {
      message: "Valid announcementId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  try {
    const announcement = await prisma.announcement.findUnique({
      where: {
        id: announcementId,
      },
    });

    if (!announcement) {
      return {
        message: "Announcement not found",
        error: "Announcement not found",
      };
    }

    return {
      message: "Announcement retrieved successfully",
      data: announcement,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
