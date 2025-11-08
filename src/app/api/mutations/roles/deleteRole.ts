"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";

export default async function deleteRole({ roleId }: { roleId: string }) {
  if (!roleId || !/^[0-9a-fA-F-]{36}$/.test(roleId)) {
    return {
      message: "Valid roleId (UUID) is required",
      error: "Valid UUID is required",
    };
  }

  try {
    const role = await prisma.role.delete({
      where: {
        id: roleId,
      },
    });

    return {
      message: "Role deleted successfully",
      data: role,
    };
  } catch (error) {
    console.error("Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          message: "Role not found",
          error: "Role not found",
        };
      }
    }
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
