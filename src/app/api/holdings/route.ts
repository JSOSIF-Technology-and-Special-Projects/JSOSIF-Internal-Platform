import { prisma } from "../../../utils/prisma";

export async function GET() {
    try {
        await prisma.$connect();
    
        const holdings = await prisma.holding.findMany({
          include: {
            team: {
              select: {
                name: true,
              },
            },
          },
        });
        
        return Response.json(holdings.map((h) => ({
          id: h.id, 
          name: h.name,
          team: h.team?.name ?? "",     
          ticker: h.ticker,
          description: h.description,
          amountInShares: h.amountInShares,
          costCad: `$${h.costCad.toString()}`, 
          industry: h.industry,
          investDate: h.investDate.toISOString().slice(0, 10),     
        })));

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

export async function POST(req: Request) {
  try {
    await prisma.$connect();

    const body = await req.json();

    const data = {
      teamId: body.teamId,
      ticker: body.ticker,
      name: body.name,
      description: body.description || null,
      industry: body.industry || null,
      investDate: new Date(body.investDate),
      divestDate: body.divestDate ? new Date(body.divestDate) : null,
      amountInShares: Number(body.amountInShares),
      costCad: Number(body.costCad),
    };

    const newHolding = await prisma.holding.create({ data });

    return Response.json(newHolding);

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

export async function DELETE(req: Request) {
  try {
    await prisma.$connect();

    const id = await req.json();

    const deleted = await prisma.holding.delete({
      where: { id }, 
    });
    
    return Response.json(JSON.stringify(deleted), {status: 200});

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

