"use server";
import { prisma } from "@/utils/prisma";

export async function listAlumni() {
  try {
    const alumni = await prisma.alumni.findMany({
      include: {
        formerMember: {
          select: {
            id: true,
            name: true,
            program: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      message: "List query ran successfully",
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
