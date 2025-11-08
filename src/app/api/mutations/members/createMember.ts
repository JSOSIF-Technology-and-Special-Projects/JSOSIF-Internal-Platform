"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";

export interface CreateMemberInput {
  name: string;
  description?: string;
  program: string;
  year: number;
  memberSince: string | Date; // ISO date string or Date object
  linkedin?: string;
  roleId?: string;
  teamId?: string;
}

export default async function createMember(input: CreateMemberInput) {
  // Validation
  if (!input.name || !input.program || !input.year || !input.memberSince) {
    return {
      message: "Missing required field(s) (name, program, year, memberSince)",
      error: "Missing required fields",
    };
  }

  // Validate year range (1-8)
  if (input.year < 1 || input.year > 8) {
    return {
      message: "Year must be between 1 and 8",
      error: "Invalid year value",
    };
  }

  try {
    const memberData: Prisma.MemberCreateInput = {
      name: input.name,
      description: input.description,
      program: input.program,
      year: input.year,
      memberSince: new Date(input.memberSince),
      ...(input.linkedin && { linkedin: input.linkedin }),
      ...(input.roleId && {
        role: {
          connect: { id: input.roleId },
        },
      }),
      ...(input.teamId && {
        team: {
          connect: { id: input.teamId },
        },
      }),
    };

    const member = await prisma.member.create({
      data: memberData,
      include: {
        role: true,
        team: true,
      },
    });

    return {
      message: "Member created successfully",
      data: member,
    };
  } catch (error) {
    console.error("Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          message: "Database error",
          error: "A member with this LinkedIn URL already exists",
        };
      }
      if (error.code === "P2025") {
        return {
          message: "Database error",
          error: "Referenced role or team not found",
        };
      }
    }
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
