"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";

export interface CreateAlumniInput {
  name: string;
  description?: string;
  companyName: string;
  industry: string;
  degree: string;
  yearsOnFund: number;
  linkedin?: string;
  formerMemberId?: string;
}

export default async function createAlumni(input: CreateAlumniInput) {
  // Validation
  if (
    !input.name ||
    !input.companyName ||
    !input.industry ||
    !input.degree ||
    input.yearsOnFund === undefined
  ) {
    return {
      message:
        "Missing required field(s) (name, companyName, industry, degree, yearsOnFund)",
      error: "Missing required fields",
    };
  }

  // Validate non-negative yearsOnFund
  if (input.yearsOnFund < 0) {
    return {
      message: "yearsOnFund must be >= 0",
      error: "Invalid yearsOnFund value",
    };
  }

  try {
    const alumniData: Prisma.AlumniCreateInput = {
      name: input.name,
      description: input.description,
      companyName: input.companyName,
      industry: input.industry,
      degree: input.degree,
      yearsOnFund: input.yearsOnFund,
      ...(input.linkedin && { linkedin: input.linkedin }),
      ...(input.formerMemberId && {
        formerMember: {
          connect: { id: input.formerMemberId },
        },
      }),
    };

    const alumni = await prisma.alumni.create({
      data: alumniData,
      include: {
        formerMember: true,
      },
    });

    return {
      message: "Alumni created successfully",
      data: alumni,
    };
  } catch (error) {
    console.error("Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          message: "Database error",
          error: "An alumni with this LinkedIn URL already exists",
        };
      }
      if (error.code === "P2025") {
        return {
          message: "Database error",
          error: "Referenced former member not found",
        };
      }
    }
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
