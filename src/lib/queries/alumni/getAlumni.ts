"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function getAlumni(alumniId: string) {
  if (!alumniId || !/^[0-9a-fA-F-]{36}$/.test(alumniId)) {
    return {
      message: "Valid alumniId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  try {
    const alumni = await prisma.alumni.findUnique({
      where: {
        id: alumniId,
      },
      include: {
        formerMember: {
          select: {
            id: true,
            name: true,
            program: true,
            year: true,
            memberSince: true,
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!alumni) {
      return {
        message: "Alumni not found",
        error: "Alumni not found",
      };
    }

    return {
      message: "Alumni retrieved successfully",
      data: alumni,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
