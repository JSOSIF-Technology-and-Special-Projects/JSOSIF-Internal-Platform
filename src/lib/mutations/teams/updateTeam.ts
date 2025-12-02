"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/utils/permissions";

export interface UpdateTeamInput {
  name?: string;
  description?: string;
}

export default async function updateTeam({
  teamId,
  input,
}: {
  teamId: string;
  input: UpdateTeamInput;
}) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!teamId || !/^[0-9a-fA-F-]{36}$/.test(teamId)) {
    return {
      message: "Valid teamId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  if (!input || Object.keys(input).length === 0) {
    return {
      message: "No fields provided for update",
      error: "At least one field must be provided",
    };
  }

  try {
    const team = await prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
      },
    });

    return {
      message: "Team updated successfully",
      data: team,
    };
  } catch (error) {
    console.error("Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          message: "Team not found",
          error: "Team not found",
        };
      }
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
