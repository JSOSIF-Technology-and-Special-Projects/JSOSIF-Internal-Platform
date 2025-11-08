"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";

export interface CreateHoldingInput {
  teamId: string;
  ticker: string;
  name: string;
  description?: string;
  investDate: string | Date;
  divestDate?: string | Date | null;
  amountInShares: number;
  costCad: number | string;
  industry?: string;
}

export default async function createHolding(input: CreateHoldingInput) {
  // Validation
  if (
    !input.teamId ||
    !input.ticker ||
    !input.name ||
    !input.investDate ||
    input.amountInShares === undefined ||
    input.costCad === undefined
  ) {
    return {
      message:
        "Missing required field(s) (teamId, ticker, name, investDate, amountInShares, costCad)",
      error: "Missing required fields",
    };
  }

  // Validate non-negative values
  if (input.amountInShares < 0) {
    return {
      message: "amountInShares must be >= 0",
      error: "Invalid amountInShares value",
    };
  }

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

  // Validate divestDate >= investDate if both provided
  if (input.divestDate) {
    const investDate = new Date(input.investDate);
    const divestDate = new Date(input.divestDate);
    if (divestDate < investDate) {
      return {
        message: "divestDate must be >= investDate",
        error: "Invalid date range",
      };
    }
  }

  try {
    const holding = await prisma.holding.create({
      data: {
        teamId: input.teamId,
        ticker: input.ticker,
        name: input.name,
        description: input.description,
        investDate: new Date(input.investDate),
        divestDate: input.divestDate ? new Date(input.divestDate) : null,
        amountInShares: input.amountInShares,
        costCad: costCadValue,
        industry: input.industry,
      },
      include: {
        team: true,
      },
    });

    return {
      message: "Holding created successfully",
      data: holding,
    };
  } catch (error) {
    console.error("Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
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
