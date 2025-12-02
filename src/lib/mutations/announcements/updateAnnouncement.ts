"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";
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
    const announcement = await prisma.announcement.update({
      where: {
        id: announcementId,
      },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.information !== undefined && {
          information: input.information,
        }),
        ...(input.publishedAt !== undefined && {
          publishedAt: new Date(input.publishedAt),
        }),
      },
    });

    return {
      message: "Announcement updated successfully",
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
