"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/utils/permissions";

export interface CreateTeamInput {
  name: string;
  description?: string;
  teamType: string;
}

export default async function createTeam(input: CreateTeamInput) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!input.name || !input.teamType) {
    return {
      message: "Name and teamType are required",
      error: "Missing required fields",
    };
  }

  // Validate teamType
  if (!["Investment", "Support"].includes(input.teamType)) {
    return {
      message: "teamType must be either 'Investment' or 'Support'",
      error: "Invalid teamType value",
    };
  }

  try {
    const team = await prisma.team.create({
      data: {
        name: input.name,
        description: input.description,
        teamType: input.teamType,
      },
      include: {
        members: true,
        holdings: true,
      },
    });

    return {
      message: "Team created successfully",
      data: team,
    };
  } catch (error) {
    console.error("Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          message: "Database error",
          error: "A team with this name already exists",
        };
      }
    }
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
