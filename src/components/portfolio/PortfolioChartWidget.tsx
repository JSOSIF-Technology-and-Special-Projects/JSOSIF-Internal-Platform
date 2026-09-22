"use client";

import React from "react";
import dynamic from "next/dynamic";
import { PortfolioHolding } from "@/data/fallbackHoldings";

const SymbolOverviewWidget = dynamic(
  () => import("@/components/admin-dashboard/SymbolOverviewWidget"),
  { ssr: false }
);

interface PortfolioChartWidgetProps {
  holdings: PortfolioHolding[];
}

export default function PortfolioChartWidget({
  holdings,
}: PortfolioChartWidgetProps) {
  // Select top equity holdings by market value to avoid overloading TradingView and exclude bond CUSIPs
  const topHoldings = [...holdings]
    .filter(
      (h) =>
        h.assetType !== "Bond" &&
        !h.name?.includes("%") &&
        !h.ticker?.startsWith("US") &&
        !h.ticker?.startsWith("CA") &&
        !h.ticker?.startsWith("BAC4")
    )
    .sort((a, b) => b.marketValue - a.marketValue)
    .slice(0, 6);

  const tickersString = topHoldings
    .map((h) => {
      let tvSymbol = h.symbol || h.ticker;
      if (tvSymbol.endsWith(".TO")) {
        tvSymbol = `TSX:${tvSymbol.replace(".TO", "")}`;
      }
      return `${tvSymbol}|12M`;
    })
    .join(",");

  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Market Action & Key Holdings
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Interactive multi-asset charting powered by TradingView for fund core positions
          </p>
        </div>

        {/* Top Holdings Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium mr-1">
            Core Weights:
          </span>
          {topHoldings.map((h) => (
            <span
              key={h.ticker}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-[#0E5791] transition-colors"
            >
              {h.ticker}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full min-h-[380px] flex items-center justify-center bg-gray-50/50 rounded-xl overflow-hidden border border-gray-100">
        {tickersString ? (
          <div className="w-full h-full py-2">
            <SymbolOverviewWidget ticker={tickersString} />
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400 text-sm">
            No active positions available for charting.
          </div>
        )}
      </div>
    </div>
  );
}
