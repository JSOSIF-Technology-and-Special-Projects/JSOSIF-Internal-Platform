import { prisma } from "../../../utils/prisma";
import YahooFinance from "yahoo-finance2";
import { createClient } from "@supabase/supabase-js";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  try {
    let rawHoldings: any[] = [];

    try {
      rawHoldings = await prisma.holding.findMany({
        include: {
          team: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (prismaErr) {
      console.warn("Prisma pooler unreachable, falling back to Supabase REST client:", prismaErr);
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
          .from("holdings")
          .select("*, team:teams(name)");
        if (error) throw error;
        rawHoldings = (data || []).map((row: any) => ({
          id: row.id,
          teamId: row.team_id,
          ticker: row.ticker,
          name: row.name,
          description: row.description,
          investDate: row.invest_date ? new Date(row.invest_date) : new Date(),
          divestDate: row.divest_date ? new Date(row.divest_date) : null,
          amountInShares: Number(row.amount_in_shares),
          costCad: Number(row.costCad),
          industry: row.industry,
          team: row.team,
        }));
      } else {
        throw prismaErr;
      }
    }

    // Helper to detect corporate bonds / fixed income debt securities
    const isBondHolding = (h: any) => {
      const ticker = (h.ticker || "").toUpperCase();
      const name = (h.name || "").toLowerCase();
      const team = (h.team?.name || "").toLowerCase();
      return (
        name.includes("%") ||
        ticker.startsWith("US") ||
        ticker.startsWith("CA") ||
        ticker.startsWith("BAC4") ||
        team.includes("fixed income")
      );
    };

    // Filter equity tickers for Yahoo Finance live pricing
    const equityTickers = rawHoldings
      .filter((h) => !isBondHolding(h))
      .map((h) => h.ticker)
      .filter(Boolean);

    let exchangeRate = 1.406;
    let quotes: any[] = [];

    try {
      if (equityTickers.length > 0) {
        const allTickers = [...new Set([...equityTickers, "CAD=X"])];
        quotes = await yahooFinance.quote(allTickers);
        const cadQuote = quotes.find((q) => q.symbol === "CAD=X");
        if (cadQuote?.regularMarketPrice) {
          exchangeRate = cadQuote.regularMarketPrice;
        }
      }
    } catch (error) {
      console.error("Failed to fetch live stock data from Yahoo Finance:", error);
    }

    const holdingsWithMarketData = rawHoldings.map((h) => {
      const isBond = isBondHolding(h);
      const shares = Number(h.amountInShares ?? h.amount_in_shares ?? 0);
      const costCad = typeof h.costCad?.toNumber === "function" ? h.costCad.toNumber() : Number(h.costCad);

      if (isBond) {
        // Corporate Bonds: Valued based on costCad input amount
        return {
          id: h.id,
          name: h.name,
          team: h.team?.name ?? "Fixed Income & Real Estate",
          ticker: h.ticker,
          symbol: h.ticker,
          description: h.description,
          amountInShares: shares,
          shares,
          costCad,
          averageCost: costCad,
          currentPrice: costCad,
          change: 0,
          changePercent: 0,
          marketValue: shares * costCad,
          sector: "Fixed Income",
          industry: "Corporate Debt",
          assetType: "Bond",
          investDate: h.investDate ? new Date(h.investDate).toISOString().slice(0, 10) : "2026-03-10",
        };
      }

      // Equity holdings
      const quote = quotes.find((q) => q.symbol === h.ticker);

      if (!quote) {
        return {
          id: h.id,
          name: h.name,
          team: h.team?.name ?? "",
          ticker: h.ticker,
          symbol: h.ticker,
          description: h.description,
          amountInShares: shares,
          shares,
          costCad,
          averageCost: costCad,
          currentPrice: costCad,
          change: 0,
          changePercent: 0,
          marketValue: shares * costCad,
          sector: h.industry || "Equity",
          industry: h.industry || "Equity",
          assetType: "Equity",
          investDate: h.investDate ? new Date(h.investDate).toISOString().slice(0, 10) : "2026-03-10",
        };
      }

      const isUSD = quote.currency === "USD";
      const multiplier = isUSD ? exchangeRate : 1;

      const rawPrice = quote.regularMarketPrice;
      const rawChange = quote.regularMarketChange;

      const currentPrice = rawPrice != null ? rawPrice * multiplier : costCad;
      const change = rawChange != null ? rawChange * multiplier : 0;
      const changePercent = quote.regularMarketChangePercent ?? 0;

      return {
        id: h.id,
        name: h.name,
        team: h.team?.name ?? "",
        ticker: h.ticker,
        symbol: h.ticker,
        description: h.description,
        amountInShares: shares,
        shares,
        costCad,
        averageCost: costCad,
        currentPrice,
        change,
        changePercent,
        marketValue: shares * currentPrice,
        sector: h.industry || "Equity",
        industry: h.industry || "Equity",
        assetType: "Equity",
        investDate: h.investDate ? new Date(h.investDate).toISOString().slice(0, 10) : "2026-03-10",
      };
    });

    return Response.json(holdingsWithMarketData);
  } catch (error) {
    console.error("Holdings API error:", error);
    return Response.json(
      {
        error: "Failed to fetch holdings",
        message: error instanceof Error ? error.message : "Unknown error",
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

    return Response.json(deleted, { status: 200 });
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
