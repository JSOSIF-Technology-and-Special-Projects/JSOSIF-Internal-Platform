"use server";
import { prisma } from "@/utils/prisma";

export async function listHoldings() {
  try {
    const holdings = await prisma.holding.findMany({
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          team: {
            name: "asc",
          },
        },
        {
          ticker: "asc",
        },
      ],
    });

    return {
      message: "List query ran successfully",
      data: holdings,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
