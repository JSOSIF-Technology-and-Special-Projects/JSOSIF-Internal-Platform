"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function getTeam(teamId: string) {
  if (!teamId || !/^[0-9a-fA-F-]{36}$/.test(teamId)) {
    return {
      message: "Valid teamId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  try {
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            program: true,
            year: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        holdings: {
          select: {
            id: true,
            ticker: true,
            name: true,
            industry: true,
            investDate: true,
            divestDate: true,
            amountInShares: true,
            costCad: true,
          },
        },
      },
    });

    if (!team) {
      return {
        message: "Team not found",
        error: "Team not found",
      };
    }

    return {
      message: "Team retrieved successfully",
      data: team,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
