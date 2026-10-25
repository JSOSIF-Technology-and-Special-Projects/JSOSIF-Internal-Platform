import { NextResponse } from "next/server";
import { watchlistSymbol } from "@/lib/watchlist/types";
import { watchlistFailure, watchlistUser } from "@/lib/watchlist/server";
import { watchlistQuote } from "@/lib/watchlist/quotes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: Request) {
  try {
    await watchlistUser();
    const raw = (new URL(request.url).searchParams.get("symbols") || "").split(",");
    if (raw.length > 20 || raw.some(value => !watchlistSymbol(value))) return NextResponse.json({ error: "Request between 1 and 20 valid stock tickers." }, { status: 400 });
    const symbols = [...new Set(raw.map(value => watchlistSymbol(value)!))];
    const data: Record<string, { quote: Awaited<ReturnType<typeof watchlistQuote>> | null; error?: string }> = {};
    // Bound upstream concurrency; cached quotes and in-flight lookups are shared.
    for (let index = 0; index < symbols.length; index += 4) {
      await Promise.all(symbols.slice(index, index + 4).map(async symbol => {
        try { data[symbol] = { quote: await watchlistQuote(symbol) }; }
        catch { data[symbol] = { quote: null, error: "Quote unavailable. Try refreshing later." }; }
      }));
    }
    return NextResponse.json({ data });
  } catch (error) {
    const failure = watchlistFailure(error);
    return NextResponse.json(failure, { status: failure.status });
  }
}
