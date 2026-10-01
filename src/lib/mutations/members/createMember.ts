"use server";
import { supabaseDb, formatDbError, generateId } from "@/utils/supabaseDb";
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
        const { data: role } = await supabaseDb
          .from("roles")
          .select("name")
          .eq("id", input.roleId)
          .maybeSingle();
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

    const id = generateId();
    const now = new Date().toISOString();
    const memberSinceDate = new Date(input.memberSince).toISOString().slice(0, 10);

    const { data: member, error } = await supabaseDb
      .from("members")
      .insert({
        id,
        name: input.name,
        description: input.description || null,
        program: input.program,
        year: input.year,
        member_since: memberSinceDate,
        linkedin: input.linkedin || null,
        user_id: userId || null,
        role_id: input.roleId || null,
        team_id: input.teamId || null,
        created_at: now,
        updated_at: now,
      })
      .select("*, role:roles(*), team:teams(*)")
      .single();

    if (error) throw error;

    const mappedMember = {
      ...member,
      memberSince: member.member_since,
      userId: member.user_id,
      roleId: member.role_id,
      teamId: member.team_id,
      createdAt: member.created_at,
      updatedAt: member.updated_at,
      role: member.role || null,
      team: member.team || null,
    };

    return {
      message: "Member created successfully",
      data: mappedMember,
      ...(userPassword && {
        userPassword, // Return password so admin can share it (only shown once)
        email: input.email,
      }),
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error",
      error: formatDbError(error),
    };
  }
}
