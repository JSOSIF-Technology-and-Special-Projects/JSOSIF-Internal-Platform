"use server";
import { prisma } from "@/utils/prisma";

export async function listMembers() {
  try {
    const members = await prisma.member.findMany({
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      message: "List query ran successfully",
      data: members,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
