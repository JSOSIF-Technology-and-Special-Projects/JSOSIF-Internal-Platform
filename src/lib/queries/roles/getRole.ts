"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function getRole(roleId: string) {
  if (!roleId || !/^[0-9a-fA-F-]{36}$/.test(roleId)) {
    return {
      message: "Valid roleId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  try {
    const role = await prisma.role.findUnique({
      where: {
        id: roleId,
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            program: true,
            year: true,
          },
        },
      },
    });

    if (!role) {
      return {
        message: "Role not found",
        error: "Role not found",
      };
    }

    return {
      message: "Role retrieved successfully",
      data: role,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
