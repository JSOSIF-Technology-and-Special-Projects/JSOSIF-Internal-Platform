"use server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/utils/prisma";
import { generateRandomPassword } from "@/utils/passwordUtils";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
);

/**
 * Creates a Supabase auth user and profile
 * Returns the user ID if successful
 */
export async function createAuthUser(
  email: string,
  password: string,
  roleName: string = "User"
): Promise<{ userId: string | null; error: string | null }> {
  try {
    // Create user in Supabase Auth
    const { data: userData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
      });

    if (createError) {
      // Check if user already exists
      const msg = (createError as any)?.message?.toLowerCase?.() ?? "";
      const code =
        (createError as any)?.status ?? (createError as any)?.statusCode;

      const alreadyExists =
        code === 422 ||
        msg.includes("already registered") ||
        msg.includes("user already exists");

      if (alreadyExists) {
        // User exists, we need to find them by listing users
        // Note: This is a workaround since getUserByEmail doesn't exist
        // In production, you might want to store email->userId mapping
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users?.users?.find((u) => u.email === email);

        if (existingUser?.id) {
          // Update profile if it exists, or create it
          await prisma.profiles.upsert({
            where: { id: existingUser.id },
            update: { role: roleName },
            create: {
              id: existingUser.id,
              role: roleName,
            },
          });
          return { userId: existingUser.id, error: null };
        }
      }

      return { userId: null, error: createError.message };
    }

    if (!userData?.user?.id) {
      return {
        userId: null,
        error: "Failed to create user: no user ID returned",
      };
    }

    const userId = userData.user.id;

    // Create or update profile
    await prisma.profiles.upsert({
      where: { id: userId },
      update: { role: roleName },
      create: {
        id: userId,
        role: roleName,
      },
    });

    return { userId, error: null };
  } catch (error) {
    console.error("Error creating auth user:", error);
    return {
      userId: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
