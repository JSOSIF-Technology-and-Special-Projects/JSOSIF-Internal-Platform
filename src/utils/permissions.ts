"use server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { supabaseDb } from "@/utils/supabaseDb";

// Match the dashboard's policy: Admin in either the profile or linked member role.
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

    const { data: profile, error: profileError } = await supabaseDb
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const profileRole = typeof profile?.role === "string" ? {
      id: profile.id,
      name: profile.role,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } : null;

    if (!profileError && profileRole?.name.toLowerCase() === "admin") {
      return {
        member: null,
        role: profileRole,
        error: null,
      };
    }

    // A generic profile role must not hide an explicitly assigned member Admin role.
    const { data: member, error: memberError } = await supabaseDb
      .from("members")
      .select("*, role:roles(*)")
      .eq("user_id", user.id)
      .maybeSingle();

    const memberRole = Array.isArray(member?.role) ? member.role[0] : member?.role;
    if (!memberError && typeof memberRole?.name === "string" && memberRole.name.toLowerCase() === "admin") {
      return { member, role: memberRole, error: null };
    }

    if (profileError || memberError) {
      console.error("Role lookup failed:", profileError || memberError);
      return { member: null, role: null, error: "Unable to verify your role. Please try again." };
    }

    const role = profileRole || memberRole;
    if (!role) {
      return {
        member: null,
        role: null,
        error: "No role found for this user",
      };
    }

    return {
      member,
      role,
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

  return typeof role.name === "string" && role.name.toLowerCase() === "admin";
}

/**
 * Requires admin permissions for a mutation
 * Returns an authorization error if the user is not an admin.
 */
export async function requireAdmin() {
  const { role, error } = await getCurrentMemberRole();

  if (error === "Not authenticated") {
    return { message: "Unauthorized", error: "Please sign in again." };
  }
  if (error && error !== "No role found for this user") {
    return { message: "Unable to verify permissions", error: "Unable to verify your role. Please try again." };
  }

  if (error || typeof role?.name !== "string" || role.name.toLowerCase() !== "admin") {
    return {
      message: "Unauthorized",
      error: "This operation requires Admin role",
    };
  }

  return null;
}
