import { NextResponse } from "next/server";
import { supabaseDb } from "@/utils/supabaseDb";
import { getPriceHistory } from "@/lib/portfolio/getPriceHistory";
import { correlate, correlationMatrix, correlationWindow, dailyReturns, MAX_ADDED_CORRELATION_STOCKS } from "@/lib/portfolio/correlation";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const symbol = query.get("symbol")?.trim().toUpperCase();
  const peers = query.getAll("compare").map((ticker) => ticker.trim().toUpperCase());
  const validTicker = (ticker: string) => /^[A-Z0-9^][A-Z0-9.^=-]{0,19}$/.test(ticker);
  if ((symbol !== undefined && !validTicker(symbol)) || peers.some((ticker) => !validTicker(ticker)) || peers.length >= MAX_ADDED_CORRELATION_STOCKS || (!symbol && peers.length)) {
    return NextResponse.json({ error: "Enter valid tickers and add no more than 10 stocks." }, { status: 400 });
  }
  try {
    const { data, error } = await supabaseDb.from("holdings").select("ticker, name, industry, amount_in_shares, team:teams(name)").gt("amount_in_shares", 0);
    if (error) throw error;
    const holdings = [...new Map((data || []).filter((holding) => {
      const ticker = holding.ticker?.trim().toUpperCase();
      const name = (holding.name || "").toLowerCase();
      const teams = Array.isArray(holding.team) ? holding.team : [holding.team];
      const isFixedIncome = teams.some((team) => /fixed[\s-]+income/i.test(team?.name || "")) ||
        /fixed[\s-]+income|\bbonds?\b/i.test(holding.industry || "") ||
        /%|\bbonds?\b|\bnotes?\b|\bdebentures?\b/.test(name) ||
        /^(?:US|CA)[A-Z0-9]{9}\d$/.test(ticker || "") || (ticker || "").startsWith("BAC4");
      return ticker && !isFixedIncome && !["CASH", "CAD.CASH"].includes(ticker) && !name.includes("cash reserve") && !name.includes("cash & equivalents");
    })
      .map((holding) => [holding.ticker.trim().toUpperCase(), { symbol: holding.ticker.trim().toUpperCase(), name: holding.name }])).values()];
    const { startDate, endDate } = correlationWindow();
    const symbols = [...new Set([...holdings.map((holding) => holding.symbol), ...peers, ...(symbol ? [symbol] : [])])];
    const histories = await Promise.allSettled(symbols.map((ticker) => getPriceHistory(ticker, startDate, endDate)));
    const series = histories.map((history) => history.status === "fulfilled" ? history.value : []);
    if (symbol) {
      const returns = series.map(dailyReturns);
      const candidate = returns[symbols.indexOf(symbol)];
      const self = correlate(candidate, candidate);
      if (self.value === null) return NextResponse.json({ error: "This ticker needs at least 30 usable daily returns with price variation." }, { status: 422 });
      return NextResponse.json({ symbol, startDate, endDate, self, comparisons: symbols.filter((ticker) => ticker !== symbol).map((ticker) => ({ symbol: ticker, name: ticker, ...correlate(candidate, returns[symbols.indexOf(ticker)]) })) });
    }
    return NextResponse.json({ holdings, matrix: correlationMatrix(series), startDate, endDate });
  } catch (error) {
    console.error("Portfolio correlation failed:", error);
    return NextResponse.json({ error: "Unable to load portfolio correlations. Please try again." }, { status: 500 });
  }
}
