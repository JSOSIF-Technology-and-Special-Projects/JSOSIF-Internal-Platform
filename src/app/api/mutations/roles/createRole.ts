"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";

export interface CreateRoleInput {
  name: string;
  description?: string;
}

export default async function createRole(input: CreateRoleInput) {
  if (!input.name) {
    return {
      message: "Missing required field: name",
      error: "Name is required",
    };
  }

  try {
    const role = await prisma.role.create({
      data: {
        name: input.name,
        description: input.description,
      },
    });

    return {
      message: "Role created successfully",
      data: role,
    };
  } catch (error) {
    console.error("Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
