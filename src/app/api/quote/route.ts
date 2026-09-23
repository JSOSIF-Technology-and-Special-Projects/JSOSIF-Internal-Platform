import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("ticker") || searchParams.get("symbol");

    if (!ticker) {
      return NextResponse.json(
        { error: "Query parameter 'ticker' or 'symbol' is required." },
        { status: 400 }
      );
    }

    const cleanTicker = ticker.trim().toUpperCase();

    // Query both the requested ticker and the CAD exchange rate
    const [quoteResult, cadResult] = await Promise.allSettled([
      yahooFinance.quote(cleanTicker),
      yahooFinance.quote("CAD=X"),
    ]);

    if (quoteResult.status === "rejected" || !quoteResult.value) {
      return NextResponse.json(
        {
          error: `Could not retrieve market quote for symbol '${cleanTicker}'.`,
          details: quoteResult.status === "rejected" ? quoteResult.reason?.message : "No data found",
        },
        { status: 404 }
      );
    }

    const quote = quoteResult.value as any;
    let exchangeRate = 1.406; // Fallback USD/CAD rate

    if (cadResult.status === "fulfilled" && cadResult.value?.regularMarketPrice) {
      exchangeRate = cadResult.value.regularMarketPrice;
    }

    const isUSD = quote.currency === "USD";
    const multiplier = isUSD ? exchangeRate : 1;

    const rawPrice = quote.regularMarketPrice ?? quote.navPrice ?? 0;
    const rawChange = quote.regularMarketChange ?? 0;
    const changePercent = quote.regularMarketChangePercent ?? 0;

    const priceCad = rawPrice * multiplier;
    const changeCad = rawChange * multiplier;

    return NextResponse.json({
      symbol: quote.symbol || cleanTicker,
      name: quote.longName || quote.shortName || quote.displayName || cleanTicker,
      currency: quote.currency || "USD",
      isUSD,
      exchangeRate: isUSD ? exchangeRate : 1,
      priceRaw: rawPrice,
      priceCad,
      changeCad,
      changePercent,
      dayHigh: (quote.regularMarketDayHigh ?? rawPrice) * multiplier,
      dayLow: (quote.regularMarketDayLow ?? rawPrice) * multiplier,
      fiftyTwoWeekHigh: (quote.fiftyTwoWeekHigh ?? rawPrice) * multiplier,
      fiftyTwoWeekLow: (quote.fiftyTwoWeekLow ?? rawPrice) * multiplier,
      volume: quote.regularMarketVolume ?? 0,
      marketCap: quote.marketCap ?? null,
      sector: quote.sector || quote.financialCurrency || "General",
    });
  } catch (error: any) {
    console.error("Error in /api/quote route:", error);
    return NextResponse.json(
      {
        error: "Internal server error fetching quote.",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
