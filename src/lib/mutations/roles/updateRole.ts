"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/utils/permissions";

export interface UpdateRoleInput {
  name?: string;
  description?: string;
}

export default async function updateRole({
  roleId,
  input,
}: {
  roleId: string;
  input: UpdateRoleInput;
}) {
  // Check admin permissions
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!roleId) {
    return {
      message: "Role ID is required",
      error: "Role ID is required",
    };
  }

  if (!input || Object.keys(input).length === 0) {
    return {
      message: "No fields provided for update",
      error: "At least one field must be provided",
    };
  }

  try {
    const role = await prisma.role.update({
      where: {
        id: roleId,
      },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
      },
    });

    return {
      message: "Role updated successfully",
      data: role,
    };
  } catch (error) {
    console.error("Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          message: "Database error",
          error: "Role not found",
        };
      }
      if (error.code === "P2002") {
        return {
          message: "Database error",
          error: "A role with this name already exists",
        };
      }
    }
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
