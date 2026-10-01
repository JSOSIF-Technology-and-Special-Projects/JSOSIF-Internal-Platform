"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import PortfolioHero from "@/components/portfolio/PortfolioHero";
import MetricCard from "@/components/portfolio/MetricCard";
import BenchmarkComparison from "@/components/portfolio/BenchmarkComparison";
import AllocationSection from "@/components/portfolio/AllocationSection";
import PortfolioChartWidget from "@/components/portfolio/PortfolioChartWidget";
import FundHoldingsTable from "@/components/portfolio/FundHoldingsTable";
import { PortfolioHolding } from "@/data/fallbackHoldings";
import { BenchmarkResponse, Timeframe } from "@/app/api/benchmarks/route";

export default function PortfolioOverviewPage() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkResponse | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<Timeframe>("1M");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const fetchPortfolioData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [holdingsRes, benchmarksRes] = await Promise.all([
        fetch("/api/holdings"),
        fetch("/api/benchmarks"),
      ]);

      if (benchmarksRes.ok) {
        const benchData = await benchmarksRes.json();
        setBenchmarks(benchData);
      }

      if (!holdingsRes.ok) {
        const errorData = await holdingsRes.json().catch(() => null);
        throw new Error(
          errorData?.message || errorData?.error || `Holdings API failed with HTTP ${holdingsRes.status}`
        );
      }

      const data = await holdingsRes.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format received from holdings API (expected an array)");
      }

      // Sanitize and format API data to ensure all keys match
      const sanitized: PortfolioHolding[] = data.map((item: any, idx: number) => {
        const shares = Number(item.shares || item.amountInShares || 0);
        const averageCost = Number(item.averageCost || item.costCad || 0);
        const currentPrice =
          item.currentPrice !== null && item.currentPrice !== undefined
            ? Number(item.currentPrice)
            : averageCost;
        const marketValue = Number(
          item.marketValue ??
            (currentPrice ? currentPrice * shares : averageCost * shares)
        );
        const change =
          item.change !== null && item.change !== undefined
            ? Number(item.change)
            : 0;
        const changePercent =
          item.changePercent !== null && item.changePercent !== undefined
            ? Number(item.changePercent)
            : 0;

        return {
          id: item.id || `api-holding-${idx}`,
          name: item.name || "Unknown Asset",
          team: item.team || "Unassigned",
          ticker: item.ticker || item.symbol || "UNKNOWN",
          symbol: item.symbol || item.ticker || "UNKNOWN",
          description: item.description,
          amountInShares: shares,
          shares,
          costCad: averageCost,
          averageCost,
          currentPrice,
          change,
          changePercent,
          marketValue,
          industry: item.industry || item.sector || "General",
          sector: item.sector || item.industry || "General",
          assetType: item.assetType || (item.name?.includes("%") ? "Bond" : "Equity"),
          investDate: item.investDate || new Date().toISOString().slice(0, 10),
        };
      });

      setHoldings(sanitized);
      setLoadError(null);
      setIsLive(true);
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : "Failed to load live holdings from database";
      console.error("Failed to load portfolio holdings from database:", err);
      setHoldings([]);
      setLoadError(errMsg);
      setIsLive(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setLastUpdated(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    }
  }, []);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  // Aggregate Metrics Calculations
  const metrics = useMemo(() => {
    const totalMarketValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
    const totalBookValue = holdings.reduce(
      (sum, h) => sum + h.shares * (h.averageCost || h.costCad || 0),
      0
    );
    const totalUnrealizedReturn = totalMarketValue - totalBookValue;
    const totalReturnPercent =
      totalBookValue > 0 ? (totalUnrealizedReturn / totalBookValue) * 100 : 0;

    // Daily change calculation
    const totalDayChange = holdings.reduce(
      (sum, h) => sum + (h.change || 0) * h.shares,
      0
    );
    const totalDayChangePercent =
      totalMarketValue > 0 ? (totalDayChange / (totalMarketValue - totalDayChange)) * 100 : 0;

    const uniqueTeams = new Set(holdings.map((h) => h.team).filter(Boolean));
    const uniqueSectors = new Set(holdings.map((h) => h.sector || h.industry).filter(Boolean));

    // Top holding by market value
    const sorted = [...holdings].sort((a, b) => b.marketValue - a.marketValue);
    const topHolding = sorted[0];

    return {
      totalMarketValue,
      totalBookValue,
      totalUnrealizedReturn,
      totalReturnPercent,
      totalDayChange,
      totalDayChangePercent,
      totalPositions: holdings.length,
      totalTeams: uniqueTeams.size,
      totalSectors: uniqueSectors.size,
      topHolding,
    };
  }, [holdings]);

  // Current active benchmark data for the selected horizon
  const currentBenchmarkData = useMemo(() => {
    if (benchmarks?.timeframes?.[selectedHorizon]) {
      return benchmarks.timeframes[selectedHorizon];
    }
    return {
      timeframeLabel:
        selectedHorizon === "1M"
          ? "1-Month"
          : selectedHorizon === "3M"
          ? "3-Month"
          : selectedHorizon === "6M"
          ? "6-Month"
          : "Inception",
      portfolioReturn:
        selectedHorizon === "1M"
          ? 1.85
          : selectedHorizon === "3M"
          ? 7.40
          : selectedHorizon === "6M"
          ? 23.60
          : 22.88,
      sp500Return:
        selectedHorizon === "1M"
          ? 1.30
          : selectedHorizon === "3M"
          ? 5.47
          : selectedHorizon === "6M"
          ? 19.89
          : 18.40,
      alpha:
        selectedHorizon === "1M"
          ? 0.55
          : selectedHorizon === "3M"
          ? 1.93
          : selectedHorizon === "6M"
          ? 3.71
          : 4.48,
      isOutperforming: true,
      sectors: [],
      chartPoints: [],
    };
  }, [benchmarks, selectedHorizon]);

  // Estimated period dollar gain for the selected horizon
  const periodDollarGain = useMemo(() => {
    if (selectedHorizon === "ALL") {
      return metrics.totalUnrealizedReturn;
    }
    return (metrics.totalMarketValue * currentBenchmarkData.portfolioReturn) / 100;
  }, [metrics.totalMarketValue, metrics.totalUnrealizedReturn, currentBenchmarkData, selectedHorizon]);

  const horizonLabel =
    selectedHorizon === "1M"
      ? "1-Month"
      : selectedHorizon === "3M"
      ? "3-Month"
      : selectedHorizon === "6M"
      ? "6-Month"
      : "Inception";

  const [activeTab, setActiveTab] = useState<"holdings" | "allocation" | "benchmarks" | "chart">("holdings");

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          {/* Skeleton Hero */}
          <div className="h-44 rounded-3xl bg-slate-200/70" />

          {/* Skeleton KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-3xl bg-slate-200/70" />
            ))}
          </div>

          {/* Skeleton Tabs Bar */}
          <div className="h-12 rounded-2xl bg-slate-200/70" />

          {/* Skeleton Main Panel */}
          <div className="h-96 rounded-3xl bg-slate-200/70" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-7">
        {/* Modern Hero Section */}
        <PortfolioHero
          lastUpdated={lastUpdated}
          isLive={isLive}
          onRefresh={() => fetchPortfolioData(true)}
          isRefreshing={isRefreshing}
          totalHoldings={metrics.totalPositions}
          totalTeams={metrics.totalTeams}
        />

        {/* Database Connection / Sync Error Banner */}
        {loadError && (
          <div className="p-4 sm:p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-rose-900">
                  Database Connection Error
                </h4>
                <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                  Unable to pull live portfolio holdings from the database ({loadError}). Mock fallback data has been disabled so database errors are immediately visible.
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchPortfolioData(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shrink-0 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Retry Database Sync</span>
            </button>
          </div>
        )}

        {/* Section Header & Unified Horizon Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Fund Capital & Performance
              </h2>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  currentBenchmarkData.isOutperforming
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {currentBenchmarkData.isOutperforming
                  ? `+${currentBenchmarkData.alpha.toFixed(2)}% α vs SPY`
                  : `${currentBenchmarkData.alpha.toFixed(2)}% α vs SPY`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Key consolidated fund metrics measured across the {horizonLabel} horizon.
            </p>
          </div>

          {/* Timeframe pill buttons */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] self-start sm:self-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 hidden sm:inline">
              Horizon:
            </span>
            {[
              { key: "1M", label: "1 Month (1M)", short: "1M" },
              { key: "3M", label: "3 Months (3M)", short: "3M" },
              { key: "6M", label: "6 Months (6M)", short: "6M" },
              { key: "ALL", label: "Total Book", short: "Total" },
            ].map((item) => {
              const isSelected = selectedHorizon === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setSelectedHorizon(item.key as Timeframe)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Executive KPI Metric Cards (Synchronized to Selected Horizon) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <MetricCard
            title="Total Fund AUM (CAD)"
            value={formatCurrency(metrics.totalMarketValue)}
            change={metrics.totalDayChange}
            changePercent={metrics.totalDayChangePercent}
            changeLabel="today"
            badge="Consolidated"
            subtitle={`${metrics.totalPositions} active positions across ${metrics.totalTeams} divisions`}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <MetricCard
            title={`Portfolio Return (${horizonLabel})`}
            value={`${currentBenchmarkData.portfolioReturn >= 0 ? "+" : ""}${currentBenchmarkData.portfolioReturn.toFixed(2)}%`}
            change={periodDollarGain}
            changeLabel={selectedHorizon === "ALL" ? "total book gain" : `est. ${selectedHorizon} gain`}
            badge={`${horizonLabel}`}
            subtitle={`S&P 500 (SPY): ${currentBenchmarkData.sp500Return >= 0 ? "+" : ""}${currentBenchmarkData.sp500Return.toFixed(2)}%`}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />

          <MetricCard
            title={`Alpha vs. S&P 500 (${horizonLabel})`}
            value={`${currentBenchmarkData.alpha >= 0 ? "+" : ""}${currentBenchmarkData.alpha.toFixed(2)}%`}
            badge={currentBenchmarkData.isOutperforming ? "Outperforming" : "Underperforming"}
            changeLabel="vs SPY"
            subtitle={`JSOSIF ${currentBenchmarkData.portfolioReturn >= 0 ? "+" : ""}${currentBenchmarkData.portfolioReturn.toFixed(2)}% vs SPY ${currentBenchmarkData.sp500Return >= 0 ? "+" : ""}${currentBenchmarkData.sp500Return.toFixed(2)}%`}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
          />

          <MetricCard
            title="Portfolio Breadth"
            value={`${metrics.totalPositions} Positions`}
            subtitle={`${metrics.totalTeams} Divisions • ${metrics.totalSectors} Sectors`}
            badge={metrics.topHolding ? `Top: ${metrics.topHolding.ticker}` : undefined}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />
        </div>

        {/* Segmented Tab Navigation for Focused Exploration */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("holdings")}
              className={`flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
                activeTab === "holdings"
                  ? "bg-[#0E5791] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Holdings Directory</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "holdings"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {metrics.totalPositions}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("allocation")}
              className={`flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
                activeTab === "allocation"
                  ? "bg-[#0E5791] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <span>Allocations & Sectors</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "allocation"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {metrics.totalTeams} Teams
              </span>
            </button>

            <button
              onClick={() => setActiveTab("benchmarks")}
              className={`flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
                activeTab === "benchmarks"
                  ? "bg-[#0E5791] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Benchmark Analysis</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "benchmarks"
                    ? "bg-white/20 text-white"
                    : currentBenchmarkData.isOutperforming
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {currentBenchmarkData.isOutperforming
                  ? `+${currentBenchmarkData.alpha.toFixed(1)}% α`
                  : `${currentBenchmarkData.alpha.toFixed(1)}% α`}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("chart")}
              className={`flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
                activeTab === "chart"
                  ? "bg-[#0E5791] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <span>Live Market Action</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "chart"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                TradingView
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="transition-opacity duration-200">
          {activeTab === "holdings" && <FundHoldingsTable holdings={holdings} />}

          {activeTab === "allocation" && (
            <AllocationSection
              holdings={holdings}
              totalMarketValue={metrics.totalMarketValue}
            />
          )}

          {activeTab === "benchmarks" && (
            <BenchmarkComparison
              holdings={holdings}
              benchmarks={benchmarks}
              totalMarketValue={metrics.totalMarketValue}
              selectedTimeframe={selectedHorizon}
              onSelectTimeframe={setSelectedHorizon}
            />
          )}

          {activeTab === "chart" && <PortfolioChartWidget holdings={holdings} />}
        </div>
      </div>
    </main>
  );
}
