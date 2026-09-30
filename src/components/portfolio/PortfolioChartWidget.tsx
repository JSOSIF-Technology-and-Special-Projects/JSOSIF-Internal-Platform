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
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Market Action & Key Holdings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive multi-asset charting powered by TradingView for fund core positions
          </p>
        </div>

        {/* Top Holdings Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-semibold mr-1">
            Core Weights:
          </span>
          {topHoldings.map((h) => (
            <span
              key={h.ticker}
              className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-[#0E5791] border border-slate-200/60 transition-colors"
            >
              {h.ticker}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full min-h-[380px] flex items-center justify-center bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-200/80">
        {tickersString ? (
          <div className="w-full h-full py-2">
            <SymbolOverviewWidget ticker={tickersString} />
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-sm">
            No active positions available for charting.
          </div>
        )}
      </div>
    </div>
  );
}
