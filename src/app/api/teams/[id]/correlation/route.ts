import { NextResponse } from "next/server";
import { supabaseDb } from "@/utils/supabaseDb";
import { getPriceHistory } from "@/lib/portfolio/getPriceHistory";
import { correlate, correlationMatrix, dailyReturns, resolveCorrelationWindow, MAX_ADDED_CORRELATION_STOCKS, weightedPortfolioReturns } from "@/lib/portfolio/correlation";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const query = new URL(request.url).searchParams;
  const window = resolveCorrelationWindow(query, new Date());
  if ("error" in window) return NextResponse.json({ error: window.error }, { status: 400 });
  const symbol = query.get("symbol")?.trim().toUpperCase();
  const comparisons = query.getAll("compare").map((ticker) => ticker.trim().toUpperCase());
  if (comparisons.length >= MAX_ADDED_CORRELATION_STOCKS) {
    return NextResponse.json({ error: `You can add up to ${MAX_ADDED_CORRELATION_STOCKS} stocks.` }, { status: 400 });
  }
  const validTicker = (ticker: string) => /^[A-Z0-9^][A-Z0-9.^=-]{0,19}$/.test(ticker);
  if (!/^[0-9a-f-]{36}$/i.test(id) || (symbol !== undefined && !validTicker(symbol)) || comparisons.some((ticker) => !validTicker(ticker)) || (!symbol && comparisons.length)) {
    return NextResponse.json({ error: "Enter a valid ticker, such as AAPL or SHOP.TO." }, { status: 400 });
  }

  try {
    const { data: team, error } = await supabaseDb.from("teams")
      .select("id, holdings(ticker, name, amount_in_shares, costCad)")
      .eq("id", id).eq("team_type", "Investment").maybeSingle();
    if (error) throw error;
    if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

    const active = team.holdings.filter((holding) => Number(holding.amount_in_shares) > 0 && holding.ticker?.trim());
    if (active.length === 0 && symbol) return NextResponse.json({ error: "This team has no current holdings to compare." }, { status: 422 });
    const { startDate, endDate } = window;
    if (!symbol) {
      const holdings = [...new Map(active.map((holding) => {
        const ticker = holding.ticker.trim().toUpperCase();
        return [ticker, { symbol: ticker, name: holding.name }];
      })).values()];
      const histories = await Promise.allSettled(holdings.map((holding) => getPriceHistory(holding.symbol, startDate, endDate)));
      const series = histories.map((history) => history.status === "fulfilled" ? history.value : []);
      return NextResponse.json({ holdings, matrix: correlationMatrix(series), startDate, endDate });
    }
    let candidate;
    try {
      candidate = dailyReturns(await getPriceHistory(symbol, startDate, endDate));
    } catch {
      return NextResponse.json({ error: "Price history could not be loaded for this ticker. Check the symbol or try again." }, { status: 422 });
    }
    if (correlate(candidate, candidate).value === null) {
      return NextResponse.json({ error: "This ticker needs at least 30 usable daily returns with price variation." }, { status: 422 });
    }

    const symbols = [...new Set(active.map((holding) => (holding.ticker || "").trim().toUpperCase()))];
    const comparisonSymbols = [...new Set([...symbols, ...comparisons])];
    const histories = await Promise.allSettled(comparisonSymbols.map((ticker) => ticker === symbol
      ? Promise.resolve(candidate)
      : getPriceHistory(ticker, startDate, endDate).then(dailyReturns)));
    const returns = histories.map((result) => result.status === "fulfilled" ? result.value : new Map<string, number>());
    const weights = symbols.map((ticker) => active.filter((holding) => (holding.ticker || "").trim().toUpperCase() === ticker)
      .reduce((sum, holding) => sum + Number(holding.amount_in_shares) * Number(holding.costCad), 0));
    const portfolio = correlate(candidate, weightedPortfolioReturns(returns.slice(0, symbols.length), weights));

    return NextResponse.json({
      symbol, startDate, endDate,
      alreadyHeld: symbols.includes(symbol),
      portfolio,
      self: correlate(candidate, candidate),
      comparisons: comparisonSymbols.map((ticker, index) => ({
        symbol: ticker || "Unknown ticker",
        name: active.find((holding) => (holding.ticker || "").trim().toUpperCase() === ticker)?.name || ticker,
        ...correlate(candidate, returns[index]),
      })),
    });
  } catch (error) {
    console.error("Stock correlation comparison failed:", error);
    return NextResponse.json({ error: "Unable to load the portfolio comparison. Please try again." }, { status: 500 });
  }
}
