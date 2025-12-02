"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/utils/permissions";

export interface CreateSupportTeamInput {
  name: string;
  description?: string;
}

export default async function createSupportTeam(input: CreateSupportTeamInput) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  // Validation
  if (!input.name) {
    return {
      message: "Missing required field: name",
      error: "Missing required fields",
    };
  }

  try {
    const teamData: Prisma.TeamCreateInput = {
      name: input.name,
      description: input.description,
      teamType: "Support",
    };

    const supportTeam = await prisma.team.create({
      data: teamData,
      include: {
        members: true,
        holdings: true,
      },
    });

    return {
      message: "Support team created successfully",
      data: supportTeam,
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
