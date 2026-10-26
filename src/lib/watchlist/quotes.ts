import "server-only";
import YahooFinance from "yahoo-finance2";
import { watchlistSymbol, type WatchlistQuote } from "./types";

const yahoo = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
const cache = new Map<string, { expires: number; value: WatchlistQuote }>();
const pending = new Map<string, Promise<WatchlistQuote>>();
let fx: { expires: number; value: number | null } | null = null;
let pendingFx: Promise<number | null> | null = null;
const positive = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value > 0;

async function cadRate(): Promise<number | null> {
  if (fx && fx.expires > Date.now()) return fx.value;
  if (pendingFx) return pendingFx;
  pendingFx = (async () => {
    try {
      const quote = await yahoo.quote("CAD=X", {}, { fetchOptions: { signal: AbortSignal.timeout(10000) } });
      if (!positive(quote.regularMarketPrice)) { fx = { value: null, expires: Date.now() + 15000 }; return null; }
      fx = { value: quote.regularMarketPrice, expires: Date.now() + 60000 };
      return fx.value;
    } catch { fx = { value: null, expires: Date.now() + 15000 }; return null; }
  })();
  try { return await pendingFx; } finally { pendingFx = null; }
}
export async function watchlistQuote(input: string): Promise<WatchlistQuote> {
  const symbol = watchlistSymbol(input);
  if (!symbol) throw new Error("Enter a valid stock ticker, such as AAPL or RY.TO.");
  const hit = cache.get(symbol);
  if (hit && hit.expires > Date.now()) return hit.value;
  const inflight = pending.get(symbol);
  if (inflight) return inflight;
  const request = (async () => {
    const quote = await yahoo.quote(symbol, {}, { fetchOptions: { signal: AbortSignal.timeout(10000) } });
    const canonical = watchlistSymbol(quote.symbol);
    if (!canonical || !["EQUITY", "ETF"].includes(quote.quoteType) || !positive(quote.regularMarketPrice)) throw new Error("A priced stock or ETF could not be found for this ticker.");
    const currency = quote.currency?.toUpperCase();
    if (currency !== "CAD" && currency !== "USD") throw new Error("Watchlists currently support stocks and ETFs quoted in CAD or USD.");
    const rate = currency === "CAD" ? 1 : await cadRate();
    const extra = quote as typeof quote & { sector?: string };
    const converted = rate === null ? null : quote.regularMarketPrice * rate;
    const value: WatchlistQuote = {
      symbol: canonical, name: (quote.longName || quote.shortName || canonical).slice(0, 255), sector: typeof extra.sector === "string" ? extra.sector.slice(0, 120) : "",
      currency, price: quote.regularMarketPrice, priceCad: converted !== null && positive(converted) ? converted : null,
      changePercent: typeof quote.regularMarketChangePercent === "number" && Number.isFinite(quote.regularMarketChangePercent) ? quote.regularMarketChangePercent : null,
      marketTime: quote.regularMarketTime instanceof Date && Number.isFinite(quote.regularMarketTime.getTime()) ? quote.regularMarketTime.toISOString() : null,
      fetchedAt: new Date().toISOString(),
    };
    if (cache.size >= 500) cache.delete(cache.keys().next().value!);
    cache.set(symbol, { value, expires: Date.now() + 60000 });
    return value;
  })();
  pending.set(symbol, request);
  try { return await request; } finally { pending.delete(symbol); }
}
