"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/utils/permissions";

export interface UpdateAlumniInput {
  name?: string;
  description?: string;
  companyName?: string;
  industry?: string;
  degree?: string;
  yearsOnFund?: number;
  linkedin?: string;
  formerMemberId?: string;
}

export default async function updateAlumni({
  alumniId,
  input,
}: {
  alumniId: string;
  input: UpdateAlumniInput;
}) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!alumniId || !/^[0-9a-fA-F-]{36}$/.test(alumniId)) {
    return {
      message: "Valid alumniId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  if (!input || Object.keys(input).length === 0) {
    return {
      message: "No fields provided for update",
      error: "At least one field must be provided",
    };
  }

  // Validate non-negative yearsOnFund if provided
  if (input.yearsOnFund !== undefined && input.yearsOnFund < 0) {
    return {
      message: "yearsOnFund must be >= 0",
      error: "Invalid yearsOnFund value",
    };
  }

  try {
    const updateData: Prisma.AlumniUpdateInput = {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.companyName !== undefined && {
        companyName: input.companyName,
      }),
      ...(input.industry !== undefined && { industry: input.industry }),
      ...(input.degree !== undefined && { degree: input.degree }),
      ...(input.yearsOnFund !== undefined && {
        yearsOnFund: input.yearsOnFund,
      }),
      ...(input.linkedin !== undefined && { linkedin: input.linkedin }),
      ...(input.formerMemberId !== undefined && {
        formerMember: input.formerMemberId
          ? {
              connect: { id: input.formerMemberId },
            }
          : {
              disconnect: true,
            },
      }),
    };

    const alumni = await prisma.alumni.update({
      where: {
        id: alumniId,
      },
      data: updateData,
      include: {
        formerMember: true,
      },
    });

    return {
      message: "Alumni updated successfully",
      data: alumni,
    };
  } catch (error) {
    console.error("Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          message: "Alumni not found",
          error: "Alumni not found",
        };
      }
      if (error.code === "P2002") {
        return {
          message: "Database error",
          error: "An alumni with this LinkedIn URL already exists",
        };
      }
    }
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
