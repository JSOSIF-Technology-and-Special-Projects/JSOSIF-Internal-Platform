"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";

export interface CreateAnnouncementInput {
  title: string;
  information: string;
  publishedAt?: string | Date;
}

export default async function createAnnouncement(
  input: CreateAnnouncementInput
) {
  // Validation
  if (!input.title || !input.information) {
    return {
      message: "Missing required field(s) (title, information)",
      error: "Missing required fields",
    };
  }

  try {
    const announcement = await prisma.announcement.create({
      data: {
        title: input.title,
        information: input.information,
        publishedAt: input.publishedAt
          ? new Date(input.publishedAt)
          : new Date(),
      },
    });

    return {
      message: "Announcement created successfully",
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
