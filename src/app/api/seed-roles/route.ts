import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function POST() {
  try {
    console.log("Seeding roles...");

    // Create Member role
    const memberRole = await prisma.role.upsert({
      where: { name: "Member" },
      update: {},
      create: {
        name: "Member",
        description: "Standard member role with basic permissions",
      },
    });

    console.log("Created/Updated Member role:", memberRole);

    // Create Admin role
    const adminRole = await prisma.role.upsert({
      where: { name: "Admin" },
      update: {},
      create: {
        name: "Admin",
        description: "Administrator role with full permissions",
      },
    });

    console.log("Created/Updated Admin role:", adminRole);

    return NextResponse.json({
      message: "Roles seeded successfully",
      data: {
        memberRole,
        adminRole,
      },
    });
  } catch (error) {
    console.error("Error seeding roles:", error);
    return NextResponse.json(
      {
        message: "Error seeding roles",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
