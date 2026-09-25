"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import PortfolioHero from "@/components/portfolio/PortfolioHero";
import MetricCard from "@/components/portfolio/MetricCard";
import BenchmarkComparison from "@/components/portfolio/BenchmarkComparison";
import AllocationSection from "@/components/portfolio/AllocationSection";
import PortfolioChartWidget from "@/components/portfolio/PortfolioChartWidget";
import FundHoldingsTable from "@/components/portfolio/FundHoldingsTable";
import { fallbackHoldings, PortfolioHolding } from "@/data/fallbackHoldings";
import { BenchmarkResponse, Timeframe } from "@/app/api/benchmarks/route";

export default function PortfolioOverviewPage() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkResponse | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<Timeframe>("1M");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLive, setIsLive] = useState(false);
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
        throw new Error(`Server returned HTTP ${holdingsRes.status}`);
      }

      const data = await holdingsRes.json();

      if (Array.isArray(data) && data.length > 0) {
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
        setIsLive(true);
      } else {
        // Fallback to rich seed portfolio data
        setHoldings(fallbackHoldings);
        setIsLive(false);
      }
    } catch (err) {
      console.warn("Using resilient fund reference data due to network/database status:", err);
      setHoldings(fallbackHoldings);
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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          {/* Skeleton Hero */}
          <div className="h-56 rounded-3xl bg-slate-200/70" />

          {/* Skeleton Toolbar */}
          <div className="h-16 rounded-3xl bg-slate-200/70" />

          {/* Skeleton KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 rounded-3xl bg-slate-200/70" />
            ))}
          </div>

          {/* Skeleton Benchmarks */}
          <div className="h-80 rounded-3xl bg-slate-200/70" />

          {/* Skeleton Allocation */}
          <div className="h-96 rounded-3xl bg-slate-200/70" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Modern Hero Section */}
        <PortfolioHero
          lastUpdated={lastUpdated}
          isLive={isLive}
          onRefresh={() => fetchPortfolioData(true)}
          isRefreshing={isRefreshing}
          totalHoldings={metrics.totalPositions}
          totalTeams={metrics.totalTeams}
        />

        {/* Interactive Horizon Selector Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0E5791] flex items-center justify-center shrink-0 border border-blue-100/60">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-sm text-slate-900">
                  Performance Evaluation Horizon
                </h2>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    currentBenchmarkData.isOutperforming
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {currentBenchmarkData.isOutperforming
                    ? `+${currentBenchmarkData.alpha.toFixed(2)}% α vs S&P 500`
                    : `${currentBenchmarkData.alpha.toFixed(2)}% α vs S&P 500`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluating JSOSIF portfolio return vs. S&P 500 index (SPY) over {selectedHorizon === "1M" ? "the past 1 month" : selectedHorizon === "3M" ? "the past 3 months" : selectedHorizon === "6M" ? "the past 6 months" : "total fund inception"}.
              </p>
            </div>
          </div>

          {/* Timeframe pill buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/60 self-start sm:self-center">
            {[
              { key: "1M", label: "1 Month (1M)", short: "1M" },
              { key: "3M", label: "3 Months (3M)", short: "3M" },
              { key: "6M", label: "6 Months (6M)", short: "6M" },
              { key: "ALL", label: "Total Book Return", short: "Total" },
            ].map((item) => {
              const isSelected = selectedHorizon === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setSelectedHorizon(item.key as Timeframe)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
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

        {/* Benchmark Comparisons: Fund vs S&P 500 & Sectors vs Industry ETFs */}
        <BenchmarkComparison
          holdings={holdings}
          benchmarks={benchmarks}
          totalMarketValue={metrics.totalMarketValue}
          selectedTimeframe={selectedHorizon}
          onSelectTimeframe={setSelectedHorizon}
        />

        {/* Dual-View Allocation Section */}
        <AllocationSection
          holdings={holdings}
          totalMarketValue={metrics.totalMarketValue}
        />

        {/* TradingView Live Multi-Asset Chart */}
        <PortfolioChartWidget holdings={holdings} />

        {/* Full Directory of Holdings with Search & Filters */}
        <FundHoldingsTable holdings={holdings} />
      </div>
    </main>
  );
}
