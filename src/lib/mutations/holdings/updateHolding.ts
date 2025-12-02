"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/utils/permissions";

export interface UpdateHoldingInput {
  teamId?: string;
  ticker?: string;
  name?: string;
  description?: string;
  investDate?: string | Date;
  divestDate?: string | Date | null;
  amountInShares?: number;
  costCad?: number | string;
  industry?: string;
}

export default async function updateHolding({
  holdingId,
  input,
}: {
  holdingId: string;
  input: UpdateHoldingInput;
}) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!holdingId || !/^[0-9a-fA-F-]{36}$/.test(holdingId)) {
    return {
      message: "Valid holdingId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  if (!input || Object.keys(input).length === 0) {
    return {
      message: "No fields provided for update",
      error: "At least one field must be provided",
    };
  }

  // Validate non-negative values if provided
  if (input.amountInShares !== undefined && input.amountInShares < 0) {
    return {
      message: "amountInShares must be >= 0",
      error: "Invalid amountInShares value",
    };
  }

  if (input.costCad !== undefined) {
    const costCadValue =
      typeof input.costCad === "string"
        ? parseFloat(input.costCad)
        : input.costCad;
    if (costCadValue < 0) {
      return {
        message: "costCad must be >= 0",
        error: "Invalid costCad value",
      };
    }
  }

  // Validate date range if both dates are being updated
  if (input.investDate && input.divestDate !== undefined) {
    const investDate = new Date(input.investDate);
    const divestDate = input.divestDate ? new Date(input.divestDate) : null;
    if (divestDate && divestDate < investDate) {
      return {
        message: "divestDate must be >= investDate",
        error: "Invalid date range",
      };
    }
  }

  try {
    const updateData: Prisma.HoldingUpdateInput = {
      ...(input.teamId !== undefined && { teamId: input.teamId }),
      ...(input.ticker !== undefined && { ticker: input.ticker }),
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.investDate !== undefined && {
        investDate: new Date(input.investDate),
      }),
      ...(input.divestDate !== undefined && {
        divestDate: input.divestDate ? new Date(input.divestDate) : null,
      }),
      ...(input.amountInShares !== undefined && {
        amountInShares: input.amountInShares,
      }),
      ...(input.costCad !== undefined && {
        costCad:
          typeof input.costCad === "string"
            ? parseFloat(input.costCad)
            : input.costCad,
      }),
      ...(input.industry !== undefined && { industry: input.industry }),
    };

    const holding = await prisma.holding.update({
      where: {
        id: holdingId,
      },
      data: updateData,
      include: {
        team: true,
      },
    });

    return {
      message: "Holding updated successfully",
      data: holding,
    };
  } catch (error) {
    console.error("Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          message: "Holding not found",
          error: "Holding not found",
        };
      }
      if (error.code === "P2003") {
        return {
          message: "Database error",
          error: "Referenced team not found",
        };
      }
    }
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
