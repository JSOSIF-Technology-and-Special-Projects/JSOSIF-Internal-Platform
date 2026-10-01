"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { PortfolioHolding } from "@/data/fallbackHoldings";
import {
  BenchmarkResponse,
  Timeframe,
  SectorComparisonItem,
} from "@/app/api/benchmarks/route";

interface BenchmarkComparisonProps {
  holdings: PortfolioHolding[];
  benchmarks: BenchmarkResponse | null;
  totalMarketValue: number;
  selectedTimeframe?: Timeframe;
  onSelectTimeframe?: (tf: Timeframe) => void;
}

export default function BenchmarkComparison({
  holdings,
  benchmarks,
  totalMarketValue,
  selectedTimeframe: propTimeframe,
  onSelectTimeframe,
}: BenchmarkComparisonProps) {
  const [internalTimeframe, setInternalTimeframe] = useState<Timeframe>("1M");
  const selectedTimeframe = propTimeframe ?? internalTimeframe;
  const setTimeframe = (tf: Timeframe) => {
    if (onSelectTimeframe) {
      onSelectTimeframe(tf);
    } else {
      setInternalTimeframe(tf);
    }
  };

  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [showChart, setShowChart] = useState<boolean>(true);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Group market value by division for allocation %
  const divisionValueMap = holdings.reduce<Record<string, number>>((acc, h) => {
    const key = h.team || "Other";
    acc[key] = (acc[key] || 0) + h.marketValue;
    return acc;
  }, {});

  // Fallback data if API is still loading
  const fallbackPeriodData = {
    timeframeLabel: `${selectedTimeframe === "1M" ? "1-Month" : selectedTimeframe === "3M" ? "3-Month" : selectedTimeframe === "6M" ? "6-Month" : "Inception"} Performance`,
    portfolioReturn: selectedTimeframe === "1M" ? 1.85 : selectedTimeframe === "3M" ? 7.40 : selectedTimeframe === "6M" ? 23.60 : 22.88,
    sp500Return: selectedTimeframe === "1M" ? 1.30 : selectedTimeframe === "3M" ? 5.47 : selectedTimeframe === "6M" ? 19.89 : 18.40,
    alpha: selectedTimeframe === "1M" ? 0.55 : selectedTimeframe === "3M" ? 1.93 : selectedTimeframe === "6M" ? 3.71 : 4.48,
    isOutperforming: true,
    sectors: [
      {
        team: "Tech, Media, & Communications",
        sector: "Information Technology",
        etfSymbol: "XLK",
        etfName: "Technology Select Sector SPDR",
        fundReturn: selectedTimeframe === "1M" ? 7.80 : selectedTimeframe === "3M" ? 12.40 : 39.50,
        etfReturn: selectedTimeframe === "1M" ? 9.01 : selectedTimeframe === "3M" ? 7.22 : 48.13,
        alpha: selectedTimeframe === "1M" ? -1.21 : selectedTimeframe === "3M" ? 5.18 : -8.63,
        isOutperforming: selectedTimeframe === "3M",
      },
      {
        team: "Financial Institutions",
        sector: "Financials",
        etfSymbol: "XLF",
        etfName: "Financial Select Sector SPDR",
        fundReturn: selectedTimeframe === "1M" ? -3.20 : selectedTimeframe === "3M" ? 6.80 : 24.10,
        etfReturn: selectedTimeframe === "1M" ? -5.87 : selectedTimeframe === "3M" ? 2.01 : 11.72,
        alpha: selectedTimeframe === "1M" ? 2.67 : selectedTimeframe === "3M" ? 4.79 : 12.38,
        isOutperforming: true,
      },
      {
        team: "Consumer & Retail",
        sector: "Consumer Staples & Discretionary",
        etfSymbol: "XLP",
        etfName: "Consumer Staples Select Sector SPDR",
        fundReturn: selectedTimeframe === "1M" ? -2.40 : selectedTimeframe === "3M" ? 4.50 : 14.80,
        etfReturn: selectedTimeframe === "1M" ? -5.40 : selectedTimeframe === "3M" ? -2.03 : 1.96,
        alpha: selectedTimeframe === "1M" ? 3.00 : selectedTimeframe === "3M" ? 6.53 : 12.84,
        isOutperforming: true,
      },
      {
        team: "Industrials & Natural Resources",
        sector: "Industrials, Materials & Energy",
        etfSymbol: "XLI",
        etfName: "Industrial Select Sector SPDR",
        fundReturn: selectedTimeframe === "1M" ? -1.80 : selectedTimeframe === "3M" ? 3.90 : 16.20,
        etfReturn: selectedTimeframe === "1M" ? -4.88 : selectedTimeframe === "3M" ? -5.52 : 5.58,
        alpha: selectedTimeframe === "1M" ? 3.08 : selectedTimeframe === "3M" ? 9.42 : 10.62,
        isOutperforming: true,
      },
      {
        team: "Healthcare",
        sector: "Healthcare & Pharmaceuticals",
        etfSymbol: "XLV",
        etfName: "Health Care Select Sector SPDR",
        fundReturn: selectedTimeframe === "1M" ? -1.10 : selectedTimeframe === "3M" ? 7.40 : 12.80,
        etfReturn: selectedTimeframe === "1M" ? -2.75 : selectedTimeframe === "3M" ? 10.79 : 16.57,
        alpha: selectedTimeframe === "1M" ? 1.65 : selectedTimeframe === "3M" ? -3.39 : -3.77,
        isOutperforming: selectedTimeframe === "1M",
      },
      {
        team: "Fixed Income & Real Estate",
        sector: "Corporate Debt & Fixed Income",
        etfSymbol: "LQD",
        etfName: "iShares IG Corporate Bond ETF",
        fundReturn: selectedTimeframe === "1M" ? 0.42 : selectedTimeframe === "3M" ? 1.28 : 2.65,
        etfReturn: selectedTimeframe === "1M" ? -1.03 : selectedTimeframe === "3M" ? -3.95 : -2.59,
        alpha: selectedTimeframe === "1M" ? 1.45 : selectedTimeframe === "3M" ? 5.23 : 5.24,
        isOutperforming: true,
      },
    ],
    chartPoints: [
      { date: "Day 0", portfolio: 0, sp500: 0 },
      { date: "Day 10", portfolio: 0.8, sp500: 0.5 },
      { date: "Day 20", portfolio: 1.2, sp500: 0.9 },
      { date: "Day 30", portfolio: 1.85, sp500: 1.3 },
    ],
  };

  const currentData =
    benchmarks?.timeframes[selectedTimeframe] ?? fallbackPeriodData;

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
          <p className="font-semibold text-slate-300 mb-1">{label}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-blue-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#2A8CD6]" />
              JSOSIF Portfolio:
            </span>
            <span className="font-bold text-white">
              {payload[0]?.value >= 0 ? "+" : ""}
              {payload[0]?.value?.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              S&P 500 (SPY):
            </span>
            <span className="font-bold text-white">
              {payload[1]?.value >= 0 ? "+" : ""}
              {payload[1]?.value?.toFixed(2)}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 1. Whole Portfolio vs S&P 500 Benchmark Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative radial gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Benchmark Comparison
              </span>
              <span className="text-xs text-slate-400">
                S&P 500 Index (SPY) Trailing Performance
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              Portfolio vs. S&P 500 Benchmark (
              {selectedTimeframe === "1M"
                ? "1 Month"
                : selectedTimeframe === "3M"
                ? "3 Months"
                : selectedTimeframe === "6M"
                ? "6 Months"
                : "All Time"}
              )
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Compare JSOSIF's trailing performance against the S&P 500 index over 1-month, 3-month, 6-month, or inception horizons.
            </p>
          </div>

          {/* Timeframe Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-800/80 border border-slate-700/60 self-start lg:self-center">
            <span className="text-xs text-slate-400 font-semibold px-2 hidden sm:inline">
              Horizon:
            </span>
            {(["1M", "3M", "6M", "ALL"] as Timeframe[]).map((tf) => {
              const label =
                tf === "1M"
                  ? "1M"
                  : tf === "3M"
                  ? "3M"
                  : tf === "6M"
                  ? "6M"
                  : "Total";
              const isSelected = selectedTimeframe === tf;
              return (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Alpha & Return Summary Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 px-5 rounded-2xl bg-white/5 border border-white/10 mb-4">
          <div className="flex flex-wrap items-center gap-5 sm:gap-8 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2A8CD6]" />
              <span className="text-slate-400">JSOSIF Trailing Return:</span>
              <span className="font-bold text-emerald-400 text-sm">
                {currentData.portfolioReturn >= 0 ? "+" : ""}{currentData.portfolioReturn.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-400">S&P 500 (SPY):</span>
              <span className="font-bold text-amber-300 text-sm">
                {currentData.sp500Return >= 0 ? "+" : ""}{currentData.sp500Return.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Net Alpha:</span>
              <span className={`font-bold text-sm ${currentData.isOutperforming ? "text-emerald-400" : "text-rose-400"}`}>
                {currentData.alpha >= 0 ? "+" : ""}{currentData.alpha.toFixed(2)}%
              </span>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            currentData.isOutperforming
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
          }`}>
            {currentData.isOutperforming ? "Outperforming S&P 500" : "Trailing S&P 500"}
          </span>
        </div>

        {/* Normalized Progression Chart (Recharts) */}
        {showChart && currentData.chartPoints && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-slate-400 font-semibold">
                {selectedTimeframe} Normalized Performance Progression (% Return Curve)
              </span>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5 text-blue-300">
                  <span className="w-3 h-0.5 bg-[#2A8CD6] inline-block" /> JSOSIF Portfolio
                </span>
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-3 h-0.5 bg-amber-400 inline-block" /> S&P 500 (SPY)
                </span>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentData.chartPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${val > 0 ? "+" : ""}${val}%`}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="portfolio"
                    name="JSOSIF Portfolio"
                    stroke="#2A8CD6"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#2A8CD6" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sp500"
                    name="S&P 500 Index"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={{ r: 4, fill: "#F59E0B" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* 2. Sectors vs Matching Industry Sector ETFs Section */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Sector vs. Industry ETF Benchmarks ({selectedTimeframe})
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#0E5791] border border-blue-100">
                {selectedTimeframe} Horizon
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluating each JSOSIF division’s trailing {selectedTimeframe} return against its matching sector ETF
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/60 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  viewMode === "cards"
                    ? "bg-white text-[#0E5791] shadow-xs font-bold"
                    : "hover:text-slate-900"
                }`}
              >
                Cards View
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  viewMode === "table"
                    ? "bg-white text-[#0E5791] shadow-xs font-bold"
                    : "hover:text-slate-900"
                }`}
              >
                Table View
              </button>
            </div>
          </div>
        </div>

        {viewMode === "cards" ? (
          /* Cards Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {currentData.sectors.map((item: SectorComparisonItem) => {
              const divAum = divisionValueMap[item.team] || 0;
              const weightPct = totalMarketValue > 0 ? (divAum / totalMarketValue) * 100 : 0;

              return (
                <div
                  key={item.team}
                  className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 hover:bg-white hover:shadow-md transition-all duration-200 group"
                >
                  {/* Division Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#0E5791] transition-colors">
                        {item.team}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {formatCurrency(divAum)} • {weightPct.toFixed(1)}% of Fund
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        item.isOutperforming
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {item.isOutperforming ? "+" : ""}
                      {item.alpha.toFixed(1)}% α
                    </span>
                  </div>

                  {/* Benchmark Match Header */}
                  <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-white border border-gray-100 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-black px-1.5 py-0.5 rounded bg-blue-100 text-[#0E5791] text-[11px]">
                        {item.etfSymbol}
                      </span>
                      <span className="text-gray-600 text-[11px] truncate max-w-[130px]">
                        {item.etfName}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 text-xs">
                      {item.etfReturn >= 0 ? "+" : ""}
                      {item.etfReturn.toFixed(1)}%
                    </span>
                  </div>

                  {/* Comparative Metrics */}
                  <div className="space-y-2 mt-3 pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 text-[11px]">
                        Fund {selectedTimeframe} Return
                      </span>
                      <span
                        className={`font-bold ${
                          item.fundReturn >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {item.fundReturn >= 0 ? "+" : ""}
                        {item.fundReturn.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 text-[11px]">
                        {item.etfSymbol} {selectedTimeframe} Return
                      </span>
                      <span className="font-semibold text-gray-700">
                        {item.etfReturn >= 0 ? "+" : ""}
                        {item.etfReturn.toFixed(1)}%
                      </span>
                    </div>

                    {/* Comparative Visual Bar */}
                    <div className="pt-1">
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.isOutperforming ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                          style={{
                            width: `${Math.min(Math.max(Math.abs(item.fundReturn) * 2, 10), 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
              <thead className="bg-gray-50/80 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Investment Division</th>
                  <th className="px-6 py-3.5 text-right">Fund Allocation</th>
                  <th className="px-6 py-3.5 text-right">Fund ({selectedTimeframe})</th>
                  <th className="px-6 py-3.5">Sector ETF Benchmark</th>
                  <th className="px-6 py-3.5 text-right">ETF ({selectedTimeframe})</th>
                  <th className="px-6 py-3.5 text-right">Spread (Alpha)</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {currentData.sectors.map((item: SectorComparisonItem) => {
                  const divAum = divisionValueMap[item.team] || 0;
                  const weightPct = totalMarketValue > 0 ? (divAum / totalMarketValue) * 100 : 0;

                  return (
                    <tr key={item.team} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {item.team}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(divAum)}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {weightPct.toFixed(1)}% weight
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            item.fundReturn >= 0 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {item.fundReturn >= 0 ? "+" : ""}
                          {item.fundReturn.toFixed(2)}%
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#0E5791] text-[11px]">
                            {item.etfSymbol}
                          </span>
                          <span className="text-gray-600">{item.etfName}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right font-medium text-gray-700 whitespace-nowrap">
                        {item.etfReturn >= 0 ? "+" : ""}
                        {item.etfReturn.toFixed(2)}%
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs ${
                            item.isOutperforming
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {item.alpha >= 0 ? "+" : ""}
                          {item.alpha.toFixed(2)}%
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            item.isOutperforming
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {item.isOutperforming ? "Outperforming" : "Underperforming"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
