"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import PortfolioHero from "@/components/portfolio/PortfolioHero";
import MetricCard from "@/components/portfolio/MetricCard";
import AllocationSection from "@/components/portfolio/AllocationSection";
import PortfolioChartWidget from "@/components/portfolio/PortfolioChartWidget";
import FundHoldingsTable from "@/components/portfolio/FundHoldingsTable";
import { fallbackHoldings, PortfolioHolding } from "@/data/fallbackHoldings";

export default function PortfolioOverviewPage() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
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
      const res = await fetch("/api/holdings");

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        // Sanitize and format API data to ensure all keys match
        const sanitized: PortfolioHolding[] = data.map((item: any, idx: number) => {
          const shares = Number(item.shares || item.amountInShares || 0);
          const averageCost = Number(item.averageCost || item.costCad || 0);
          const currentPrice = item.currentPrice !== null && item.currentPrice !== undefined
            ? Number(item.currentPrice)
            : averageCost;
          const marketValue = Number(
            item.marketValue ?? (currentPrice ? currentPrice * shares : averageCost * shares)
          );
          const change = item.change !== null && item.change !== undefined
            ? Number(item.change)
            : 0;
          const changePercent = item.changePercent !== null && item.changePercent !== undefined
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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 pt-32 sm:pt-36">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          {/* Skeleton Hero */}
          <div className="h-64 rounded-3xl bg-gray-200" />

          {/* Skeleton KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-gray-200" />
            ))}
          </div>

          {/* Skeleton Allocation */}
          <div className="h-96 rounded-2xl bg-gray-200" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-gray-900 p-4 sm:p-6 lg:p-8 pt-28 sm:pt-36">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Modern Hero Section */}
        <PortfolioHero
          lastUpdated={lastUpdated}
          isLive={isLive}
          onRefresh={() => fetchPortfolioData(true)}
          isRefreshing={isRefreshing}
          totalHoldings={metrics.totalPositions}
          totalTeams={metrics.totalTeams}
        />

        {/* Executive KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <MetricCard
            title="Total Fund AUM (CAD)"
            value={formatCurrency(metrics.totalMarketValue)}
            change={metrics.totalDayChange}
            changePercent={metrics.totalDayChangePercent}
            changeLabel="today"
            badge="Consolidated"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <MetricCard
            title="Total Unrealized Return"
            value={formatCurrency(metrics.totalUnrealizedReturn)}
            change={metrics.totalUnrealizedReturn}
            changePercent={metrics.totalReturnPercent}
            changeLabel="overall"
            subtitle={`Invested Capital: ${formatCurrency(metrics.totalBookValue)}`}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />

          <MetricCard
            title="Today's Market Movement"
            value={formatCurrency(metrics.totalDayChange)}
            change={metrics.totalDayChange}
            changePercent={metrics.totalDayChangePercent}
            changeLabel="vs prev close"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
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
