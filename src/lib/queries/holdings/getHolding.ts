"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function getHolding(holdingId: string) {
  if (!holdingId || !/^[0-9a-fA-F-]{36}$/.test(holdingId)) {
    return {
      message: "Valid holdingId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  try {
    const holding = await prisma.holding.findUnique({
      where: {
        id: holdingId,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!holding) {
      return {
        message: "Holding not found",
        error: "Holding not found",
      };
    }

    return {
      message: "Holding retrieved successfully",
      data: holding,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
