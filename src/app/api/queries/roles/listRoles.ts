"use server";
import { prisma } from "@/utils/prisma";

export async function listRoles() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        members: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      message: "List query ran successfully",
      data: roles,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
