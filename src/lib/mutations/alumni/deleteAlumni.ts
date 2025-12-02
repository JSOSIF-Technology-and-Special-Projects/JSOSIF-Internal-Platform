"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/utils/permissions";

export default async function deleteAlumni({ alumniId }: { alumniId: string }) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!alumniId || !/^[0-9a-fA-F-]{36}$/.test(alumniId)) {
    return {
      message: "Valid alumniId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  try {
    const alumni = await prisma.alumni.delete({
      where: {
        id: alumniId,
      },
    });

    return {
      message: "Alumni deleted successfully",
      data: alumni,
    };
  } catch (error) {
    console.error("Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          message: "Alumni not found",
          error: "Alumni not found",
        };
      }
    }
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
