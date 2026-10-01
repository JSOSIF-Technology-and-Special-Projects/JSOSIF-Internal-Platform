import { supabaseDb, generateId } from "@/utils/supabaseDb";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export async function GET() {
  try {
    const { data, error } = await supabaseDb
      .from("holdings")
      .select("*, team:teams(name)");

    if (error) throw error;

    const rawHoldings = (data || []).map((row: any) => ({
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

    const holdingsWithMarketData = rawHoldings.map((h: any) => {
      const isBond = isBondHolding(h);
      const shares = Number(h.amountInShares ?? h.amount_in_shares ?? 0);
      const costCad = Number(h.costCad || 0);

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
    const id = generateId();
    const now = new Date().toISOString();

    const { data: newHolding, error } = await supabaseDb
      .from("holdings")
      .insert({
        id,
        team_id: body.teamId,
        ticker: body.ticker,
        name: body.name,
        description: body.description || null,
        industry: body.industry || null,
        invest_date: body.investDate ? new Date(body.investDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        divest_date: body.divestDate ? new Date(body.divestDate).toISOString().slice(0, 10) : null,
        amount_in_shares: Number(body.amountInShares),
        costCad: Number(body.costCad),
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json(newHolding);
  } catch (error) {
    console.error("Holdings POST error:", error);
    return Response.json(
      {
        error: "Database operation failed",
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

    const { data: deleted, error } = await supabaseDb
      .from("holdings")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return Response.json(deleted, { status: 200 });
  } catch (error) {
    console.error("Holdings DELETE error:", error);
    return Response.json(
      {
        error: "Database operation failed",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
