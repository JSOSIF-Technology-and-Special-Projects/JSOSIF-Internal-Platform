"use server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { prisma } from "@/utils/prisma";

/**
 * Gets the current authenticated user's member record and their role
 * This function mimics how we should get the member's role for permission checks
 *
 * TODO: Once you implement the link between auth.users and Member, update this function
 * to properly find the member record (e.g., by email, user_id, etc.)
 */
export async function getCurrentMemberRole() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get the current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        member: null,
        role: null,
        error: "Not authenticated",
      };
    }

    // Find member by userId (links to auth.users.id)
    const member = await prisma.member.findFirst({
      where: {
        userId: user.id,
      },
      include: { role: true },
    });

    if (!member) {
      return {
        member: null,
        role: null,
        error: "Member not found for this user",
      };
    }

    if (!member.role) {
      return {
        member: null,
        role: null,
        error: "Member does not have a role assigned",
      };
    }

    return {
      member,
      role: member.role,
      error: null,
    };
  } catch (error) {
    console.error("Error getting current member role:", error);
    return {
      member: null,
      role: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Checks if the current user has the 'Admin' role
 * Returns true if the user is an admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const { role, error } = await getCurrentMemberRole();

  if (error || !role) {
    return false;
  }

  return role.name === "Admin";
}

/**
 * Requires admin permissions for a mutation
 * Throws an error if the user is not an admin
 */
export async function requireAdmin() {
  const admin = await isAdmin();

  if (!admin) {
    return {
      message: "Unauthorized",
      error: "This operation requires Admin role",
    };
  }

  return null;
}
