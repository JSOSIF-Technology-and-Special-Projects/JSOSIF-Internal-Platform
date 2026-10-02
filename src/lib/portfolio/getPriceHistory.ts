import "server-only";
import { unstable_cache } from "next/cache";
import YahooFinance from "yahoo-finance2";
import type { PricePoint } from "./correlation";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export const getPriceHistory = unstable_cache(
  async (symbol: string, startDate: string, endDate: string): Promise<PricePoint[]> => {
    const result = await yahooFinance.chart(symbol, {
      period1: startDate,
      period2: endDate,
      interval: "1d",
    }, { fetchOptions: { signal: AbortSignal.timeout(15000) } });
    return result.quotes.map((quote) => ({
      date: quote.date.toISOString().slice(0, 10),
      price: quote.adjclose ?? null,
    }));
  },
  ["portfolio-adjusted-price-history-v1"],
  { revalidate: 3600 },
);
