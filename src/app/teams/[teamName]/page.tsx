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
    <div className="min-h-screen bg-gray-50 p-6 pt-[9rem]">
      {/* Header Section */}
      <div className="mb-8 relative">
        <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-6 bg-[#0E5791]">
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{teamNameLabel}</h1>
          </div>
        </div>
        <p className="text-gray-600 max-w-4xl">
          {teamDescription}
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <PerformanceMetrics
          title="Total Market Value (CAD)"
          value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          className="bg-white"
        />
        <PerformanceMetrics
          title="Holdings"
          value={`${holdings.length}`}
          className="bg-white"
        />
        <PerformanceMetrics
          title="Total Shares"
          value={totalShares.toLocaleString()}
          className="bg-white"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Composition Chart */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Portfolio Composition</h2>
            {portfolioComposition.length > 0 ? (
               <PortfolioCompositionChart data={portfolioComposition} />
            ) : (
               <p className="text-gray-500">No composition data available.</p>
            )}
          </div>
        </div>

        {/* TradingView Overview Widget */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Chart & Price</h2>
            {tickersString ? (
              <SymbolOverviewWidget ticker={tickersString} />
            ) : (
              <p className="text-gray-500">No holdings available yet for charting.</p>
            )}
          </div>
        </div>

        {/* Holdings Table */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Holdings</h2>
            {holdings.length > 0 ? (
              <HoldingsTable holdings={holdings} />
            ) : (
              <p className="text-gray-500">No holdings available yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-6">
        <Link href="/teams" className="text-[#0E5791] hover:underline font-medium">
          &larr; Back to Teams
        </Link>
      </div>
    </div>
  );
}