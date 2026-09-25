import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import YahooFinance from "yahoo-finance2";
import SymbolOverviewWidget from "@/components/admin-dashboard/SymbolOverviewWidget";
import PortfolioCompositionChart from "@/components/admin-dashboard/PortfolioCompositionChart";
import HoldingsTable from "@/components/admin-dashboard/HoldingsTable";
import PerformanceMetrics from "@/components/admin-dashboard/PerformanceMetrics";
import { prisma } from "@/utils/prisma";

const yahooFinance = new YahooFinance();
// Cache this page for 60 seconds so you don't spam the Yahoo Finance API on every refresh
export const revalidate = 60;

function slugifyTeamName(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamName: string }>;
}) {
  const { teamName } = await params;
  
  // 1. Fetch the team and their holdings from the database
  const teams = await prisma.team.findMany({
    where: { teamType: "Investment" },
    include: {
      holdings: true,
    },
  });

  const team = teams.find((entry) => slugifyTeamName(entry.name) === teamName);
  if (!team) {
    notFound();
  }

  const teamNameLabel = team.name;
  const teamDescription = team.description ?? "No team description available yet.";

  // 2. Extract tickers and fetch live market data from Yahoo Finance
  const rawTickers = team.holdings.map((h) => h.ticker);
  let liveQuotes: any[] = [];
  let exchangeRate = 1;
  
  try {
    if (rawTickers.length > 0) {
      liveQuotes = await yahooFinance.quote([...rawTickers, "CAD=X"]);
      const cadQuote = liveQuotes.find((q) => q.symbol === "CAD=X");
      if (cadQuote?.regularMarketPrice) {
        exchangeRate = cadQuote.regularMarketPrice;
      }
    }
  } catch (error) {
    console.error("Failed to fetch live stock data:", error);
  }

  // 3. Map the database holdings and merge them with the live Yahoo data
  const holdings = team.holdings.map((holding) => {
    const quote = liveQuotes.find((q) => q.symbol === holding.ticker);
    
    // Check if the stock is priced in USD. If so, apply the live exchange rate.
    const isUSD = quote?.currency === "USD";
    const multiplier = isUSD ? exchangeRate : 1;
    
    const rawPrice = quote?.regularMarketPrice;
    const rawChange = quote?.regularMarketChange;

    // Convert the raw USD prices to CAD, or fallback to the database book cost
    const currentPrice = rawPrice ? (rawPrice * multiplier) : Number(holding.costCad);
    const change = rawChange ? (rawChange * multiplier) : 0;
    
    // Percentage change is relative, so it remains exactly the same regardless of currency!
    const changePercent = quote?.regularMarketChangePercent ?? 0;

    return {
      symbol: holding.ticker,
      name: holding.name,
      shares: holding.amountInShares,
      averageCost: Number(holding.costCad),
      currentPrice: currentPrice,
      change: change,
      changePercent: changePercent,
    };
  });

  // 4. Calculate live portfolio metrics based on the newly merged data
  const totalValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
  const totalShares = holdings.reduce((sum, h) => sum + h.shares, 0);

  // 5. Generate the composition data for the pie chart using live values
  const portfolioComposition = holdings.map((holding, index) => {
    const value = holding.shares * holding.currentPrice;
    const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
    const palette = ["#0E5791", "#1570B8", "#2A8CD6", "#63A8E1", "#98C5EC"];

    return {
      symbol: holding.symbol,
      name: holding.name,
      percentage,
      color: palette[index % palette.length],
    };
  });

  // 6. Format tickers for the TradingView charting widget
  const tickersString = holdings.map((h) => {
    let tvSymbol = h.symbol;
    if (tvSymbol.endsWith(".TO")) {
      tvSymbol = `TSX:${tvSymbol.replace(".TO", "")}`;
    }
    return `${tvSymbol}|12M`;
  }).join(",");
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B2A4A] to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800/80">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 backdrop-blur-md border border-white/15 text-white">
                  Investment Research Division
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">
                {teamNameLabel}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {teamDescription}
              </p>
            </div>

            <Link
              href={`/simulator?team=${encodeURIComponent(teamNameLabel)}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto active:scale-95 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Simulate Trade for {teamNameLabel}</span>
            </Link>
          </div>
        </div>

        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Market Value (CAD)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 mt-1">Live market valuation</p>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Holdings
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {holdings.length}
            </div>
            <p className="text-xs text-slate-400 mt-1">Covered equities in division</p>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Division Shares
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {totalShares.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">Consolidated unit quantity</p>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Composition Chart */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Portfolio Composition</h2>
              {portfolioComposition.length > 0 ? (
                <PortfolioCompositionChart data={portfolioComposition} />
              ) : (
                <p className="text-slate-400 text-xs py-8 text-center">No composition data available.</p>
              )}
            </div>
          </div>

          {/* TradingView Overview Widget */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Chart & Price Action</h2>
              {tickersString ? (
                <div className="rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-50/50">
                  <SymbolOverviewWidget ticker={tickersString} />
                </div>
              ) : (
                <p className="text-slate-400 text-xs py-8 text-center">No holdings available yet for charting.</p>
              )}
            </div>
          </div>

          {/* Holdings Table */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-4">Division Holdings</h2>
              {holdings.length > 0 ? (
                <HoldingsTable holdings={holdings} />
              ) : (
                <p className="text-slate-400 text-xs py-8 text-center">No holdings recorded for this team.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-2">
          <Link href="/teams" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E5791] hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to All Teams</span>
          </Link>
        </div>
      </div>
    </div>
  );
}