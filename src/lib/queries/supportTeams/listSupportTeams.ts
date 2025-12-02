"use server";
import { prisma } from "@/utils/prisma";

export async function listSupportTeams() {
  try {
    const supportTeams = await prisma.team.findMany({
      where: {
        teamType: "Support",
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            program: true,
            year: true,
          },
        },
        holdings: {
          select: {
            id: true,
            ticker: true,
            name: true,
            industry: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      message: "List query ran successfully",
      data: supportTeams,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
