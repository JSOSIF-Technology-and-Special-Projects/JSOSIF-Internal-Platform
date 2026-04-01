import { prisma } from "../../../utils/prisma";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export async function GET() {
    try {
        const holdings = await prisma.holding.findMany({
          include: {
            team: {
              select: {
                name: true,
              },
            },
          },
        });
        
        const tickers = holdings.map((h) => h.ticker);
        let exchangeRate = 1;
        let quotes: any[] = [];

        try {
            if (tickers.length > 0) {
                const allTickers = [...new Set([...tickers, "CAD=X"])];
                quotes = await yahooFinance.quote(allTickers);
                const cadQuote = quotes.find((q) => q.symbol === "CAD=X");
                if (cadQuote?.regularMarketPrice) {
                    exchangeRate = cadQuote.regularMarketPrice;
                }
            }
        } catch (error) {
            console.error("Failed to fetch live stock data:", error);
        }

        const holdingsWithMarketData = holdings.map((h) => {
            const quote = quotes.find((q) => q.symbol === h.ticker);

            if (!quote) {
                return {
                    ...h,
                    currentPrice: null,
                    change: null,
                    changePercent: null,
                };
            }
            
            const isUSD = quote.currency === "USD";
            const multiplier = isUSD ? exchangeRate : 1;
            
            const rawPrice = quote.regularMarketPrice;
            const rawChange = quote.regularMarketChange;

            const currentPrice = rawPrice != null ? rawPrice * multiplier : null;
            const change = rawChange != null ? rawChange * multiplier : null;
            
            const changePercent = quote.regularMarketChangePercent;

            return {
                ...h,
                currentPrice,
                change,
                changePercent,
            };
        });

        return Response.json(holdingsWithMarketData.map((h) => ({
          id: h.id, 
          name: h.name,
          team: h.team?.name ?? "",     
          ticker: h.ticker,
          description: h.description,
          amountInShares: h.amountInShares,
          costCad: h.costCad.toNumber(),
          industry: h.industry,
          investDate: h.investDate.toISOString().slice(0, 10),
          marketValue: h.currentPrice ? h.currentPrice * h.amountInShares : Number(h.costCad) * h.amountInShares,
          sector: h.industry || "Unknown",
          shares: h.amountInShares,
          averageCost: h.costCad.toNumber(),
          currentPrice: h.currentPrice,
          change: h.change,
          changePercent: h.changePercent,
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
      }
}

export async function POST(req: Request) {
  try {
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
  }

}

export async function DELETE(req: Request) {
  try {
    const id = await req.json();

    const deleted = await prisma.holding.delete({
      where: { id }, 
    });
    
    return Response.json(deleted, {status: 200});

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
