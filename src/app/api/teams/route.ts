import { prisma } from "../../../utils/prisma";

export async function GET() {
    try {
        const teams = await prisma.team.findMany(
          {
            select: {
              id: true,
              name: true,
              teamType: true,
            },
            orderBy: { name: "asc" },
          }
        );

        return Response.json(teams);

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
      }
}
