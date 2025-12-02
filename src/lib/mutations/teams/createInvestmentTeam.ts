"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/utils/permissions";

export interface CreateInvestmentTeamInput {
  name: string;
  description?: string;
}

export default async function createInvestmentTeam(
  input: CreateInvestmentTeamInput
) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!input.name) {
    return {
      message: "Name is required",
      error: "Missing required fields",
    };
  }

  try {
    const team = await prisma.team.create({
      data: {
        name: input.name,
        description: input.description,
        teamType: "Investment", // Always set to Investment
      },
      include: {
        members: true,
        holdings: true,
      },
    });

    return {
      message: "Investment team created successfully",
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
