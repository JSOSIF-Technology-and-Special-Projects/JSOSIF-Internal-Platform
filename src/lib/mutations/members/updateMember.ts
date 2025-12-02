"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/utils/permissions";

export interface UpdateMemberInput {
  name?: string;
  description?: string;
  program?: string;
  year?: number;
  memberSince?: string | Date;
  linkedin?: string;
  roleId?: string;
  teamId?: string;
}

export default async function updateMember({
  memberId,
  input,
}: {
  memberId: string;
  input: UpdateMemberInput;
}) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!memberId || !/^[0-9a-fA-F-]{36}$/.test(memberId)) {
    return {
      message: "Valid memberId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  if (!input || Object.keys(input).length === 0) {
    return {
      message: "No fields provided for update",
      error: "At least one field must be provided",
    };
  }

  // Validate year range if provided
  if (input.year !== undefined && (input.year < 1 || input.year > 8)) {
    return {
      message: "Year must be between 1 and 8",
      error: "Invalid year value",
    };
  }

  try {
    const updateData: Prisma.MemberUpdateInput = {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.program !== undefined && { program: input.program }),
      ...(input.year !== undefined && { year: input.year }),
      ...(input.memberSince !== undefined && {
        memberSince: new Date(input.memberSince),
      }),
      ...(input.linkedin !== undefined && { linkedin: input.linkedin }),
      ...(input.roleId !== undefined && {
        role: input.roleId
          ? {
              connect: { id: input.roleId },
            }
          : {
              disconnect: true,
            },
      }),
      ...(input.teamId !== undefined && {
        team: input.teamId
          ? {
              connect: { id: input.teamId },
            }
          : {
              disconnect: true,
            },
      }),
    };

    const member = await prisma.member.update({
      where: {
        id: memberId,
      },
      data: updateData,
      include: {
        role: true,
        team: true,
      },
    });

    return {
      message: "Member updated successfully",
      data: member,
    };
  } catch (error) {
    console.error("Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          message: "Member not found",
          error: "Member not found",
        };
      }
      if (error.code === "P2002") {
        return {
          message: "Database error",
          error: "A member with this LinkedIn URL already exists",
        };
      }
    }
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
