"use server";
import { prisma } from "@/utils/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/utils/permissions";

export default async function deleteMember({ memberId }: { memberId: string }) {
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

  try {
    const member = await prisma.member.delete({
      where: {
        id: memberId,
      },
    });

    return {
      message: "Member deleted successfully",
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
    }
    return {
      message: "Database error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
