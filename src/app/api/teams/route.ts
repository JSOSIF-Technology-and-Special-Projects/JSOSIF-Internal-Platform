import { prisma } from "../../../utils/prisma";

export async function GET() {
    try {
        await prisma.$connect();
    
        const teams = await prisma.team.findMany(
          {
            select: {
              id: true,
              name: true
            }
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
      } finally {
        await prisma.$disconnect();
      }
}

