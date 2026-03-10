import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SymbolOverviewWidget from "@/components/admin-dashboard/SymbolOverviewWidget";
import PortfolioCompositionChart from "@/components/admin-dashboard/PortfolioCompositionChart";
import HoldingsTable from "@/components/admin-dashboard/HoldingsTable";
import PerformanceMetrics from "@/components/admin-dashboard/PerformanceMetrics";
import { prisma } from "@/utils/prisma";

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

  const totalValue = team.holdings.reduce(
    (sum, h) => sum + Number(h.costCad) * h.amountInShares,
    0
  );
  const totalShares = team.holdings.reduce((sum, h) => sum + h.amountInShares, 0);

  const portfolioComposition = team.holdings.map((holding, index) => {
    const value = Number(holding.costCad) * holding.amountInShares;
    const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
    const palette = ["#0E5791", "#1570B8", "#2A8CD6", "#63A8E1", "#98C5EC"];

    return {
      symbol: holding.ticker,
      name: holding.name,
      percentage,
      color: palette[index % palette.length],
    };
  });

  const holdings = team.holdings.map((holding) => ({
    symbol: holding.ticker,
    name: holding.name,
    price: Number(holding.costCad),
    change: 0,
    changePercent: 0,
    volume: holding.amountInShares,
  }));

  const tickers = team.holdings.map((holding) => `${holding.ticker}|12M`).join(",");

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-[9rem]">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <PerformanceMetrics
          title="Total Value (CAD)"
          value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Portfolio Composition</h2>
            <PortfolioCompositionChart data={portfolioComposition} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Chart & Price</h2>
            {tickers ? (
              <SymbolOverviewWidget ticker={tickers} />
            ) : (
              <p className="text-gray-500">No holdings available yet for charting.</p>
            )}
          </div>
        </div>

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

      <div className="mt-6">
        <Link href="/teams" className="text-[#0E5791] hover:underline">
          Back to teams
        </Link>
      </div>
    </div>
  );
}
