import { prisma } from "../../../utils/prisma";

export async function GET() {
  try {
    console.log("Testing Prisma connection...");

    // Test basic connection first
    await prisma.$connect();
    console.log("Prisma connected successfully");

    const profiles = await prisma.profiles.findMany();
    console.log("Profiles found:", profiles.length);

    return Response.json({
      success: true,
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    console.error("Prisma error:", error);
    return Response.json(
      {
        error: "Database connection failed",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
