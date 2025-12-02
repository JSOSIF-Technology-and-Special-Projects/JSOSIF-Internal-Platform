"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/utils/permissions";
import { createAuthUser } from "@/utils/userCreation";
import { generateRandomPassword } from "@/utils/passwordUtils";

export interface CreateMemberInput {
  name: string;
  description?: string;
  program: string;
  year: number;
  memberSince: string | Date; // ISO date string or Date object
  linkedin?: string;
  roleId?: string;
  teamId?: string;
  // Optional: if provided, creates a user account for this member
  email?: string;
  password?: string; // If not provided, a random password will be generated
  createUser?: boolean; // If true and email provided, creates user account
}

export default async function createMember(input: CreateMemberInput) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

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

  // Validate email if creating user
  if (input.createUser && !input.email) {
    return {
      message: "Email is required when creating a user account",
      error: "Email required",
    };
  }

  try {
    let userId: string | undefined;
    let userPassword: string | undefined;

    // Create user account if requested
    if (input.createUser && input.email) {
      const password = input.password || generateRandomPassword();
      userPassword = password; // Store to return in response

      // Get role name for the profile
      let roleName = "User"; // Default
      if (input.roleId) {
        const role = await prisma.role.findUnique({
          where: { id: input.roleId },
        });
        if (role) {
          roleName = role.name;
        }
      }

      const { userId: createdUserId, error: userError } = await createAuthUser(
        input.email,
        password,
        roleName
      );

      if (userError) {
        return {
          message: "Failed to create user account",
          error: userError,
        };
      }

      if (!createdUserId) {
        return {
          message: "Failed to create user account",
          error: "No user ID returned",
        };
      }

      userId = createdUserId;
    }

    const memberData: Prisma.MemberCreateInput = {
      name: input.name,
      description: input.description,
      program: input.program,
      year: input.year,
      memberSince: new Date(input.memberSince),
      ...(input.linkedin && { linkedin: input.linkedin }),
      ...(userId && { userId }), // Link to auth user if created
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
      ...(userPassword && {
        userPassword, // Return password so admin can share it (only shown once)
        email: input.email,
      }),
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
