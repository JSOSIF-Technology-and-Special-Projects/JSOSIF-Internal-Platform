"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";

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
    const announcement = await prisma.announcement.delete({
      where: {
        id: announcementId,
      },
    });

    return {
      message: "Announcement deleted successfully",
      data: announcement,
    };
  } catch (error) {
    console.error("Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          message: "Announcement not found",
          error: "Announcement not found",
        };
      }
    }
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
