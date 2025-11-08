"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function getMember(memberId: string) {
  if (!memberId || !/^[0-9a-fA-F-]{36}$/.test(memberId)) {
    return {
      message: "Valid memberId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  try {
    const member = await prisma.member.findUnique({
      where: {
        id: memberId,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        alumni: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
      },
    });

    if (!member) {
      return {
        message: "Member not found",
        error: "Member not found",
      };
    }

    return {
      message: "Member retrieved successfully",
      data: member,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
