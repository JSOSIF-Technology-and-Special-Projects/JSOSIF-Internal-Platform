"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  IPS_METADATA,
  IPS_OBJECTIVES,
  IPS_RETURN_TARGETS,
  IPS_EXPENDITURES,
  IPS_ASSET_ALLOCATION,
  IPS_CONSTRAINTS,
  IPS_PERMITTED_INVESTMENTS,
  IPS_GOVERNANCE,
  IPS_APPENDICES,
  evaluatePortfolioIpsCompliance,
  IpsComplianceResult,
} from "@/data/ipsData";
import { PortfolioHolding } from "@/data/fallbackHoldings";

type ActiveTab =
  | "all"
  | "asset-allocation"
  | "constraints"
  | "governance"
  | "policies";

export default function InvestmentPolicyPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [isLoadingHoldings, setIsLoadingHoldings] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cashReserve, setCashReserve] = useState<number>(10171);

  // Load live holdings and database cash for real-time compliance check
  const loadData = useCallback(async () => {
    setIsLoadingHoldings(true);
    setLoadError(null);
    try {
      const [holdingsRes, cashRes] = await Promise.all([
        fetch("/api/holdings"),
        fetch("/api/portfolio/cash"),
      ]);

      if (cashRes.ok) {
        const cashData = await cashRes.json();
        if (cashData?.cashBalance !== undefined && !isNaN(Number(cashData.cashBalance))) {
          setCashReserve(Number(cashData.cashBalance));
        }
      }

      if (!holdingsRes.ok) {
        const errorData = await holdingsRes.json().catch(() => null);
        throw new Error(errorData?.message || errorData?.error || `Holdings API returned HTTP ${holdingsRes.status}`);
      }

      const data = await holdingsRes.json();
      if (Array.isArray(data)) {
        // Filter out cash from holdings so non-cash assets and cash are clean
        const nonCashHoldings = data.filter((h: any) => h.ticker !== "CASH");
        setHoldings(nonCashHoldings);

        // Also check if cash was present in holdings response as secondary source
        const cashItem = data.find((h: any) => h.ticker === "CASH");
        if (cashItem && !cashRes.ok) {
          setCashReserve(Number(cashItem.marketValue || cashItem.costCad || 10171));
        }
      } else {
        throw new Error("Invalid response format received from holdings API");
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Failed to load live holdings from database";
      console.error("Failed to load live holdings from database for IPS:", err);
      setLoadError(msg);
      setHoldings([]);
    } finally {
      setIsLoadingHoldings(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute live compliance result
  const compliance: IpsComplianceResult = useMemo(() => {
    return evaluatePortfolioIpsCompliance(holdings, cashReserve);
  }, [holdings, cashReserve]);

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter constraints based on search
  const filteredConstraints = useMemo(() => {
    if (!searchQuery.trim()) return IPS_CONSTRAINTS;
    const q = searchQuery.toLowerCase();
    return IPS_CONSTRAINTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.rule.toLowerCase().includes(q) ||
        c.details.toLowerCase().includes(q) ||
        c.limit.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ========================================================================= */}
        {/* TOP HERO & OFFICIAL METADATA BANNER (High-Contrast, Clean Light Aesthetic) */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-white text-slate-900 p-6 sm:p-8 lg:p-10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] border border-slate-200/90">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-[#0E5791] border border-blue-200/80">
                <svg className="w-4 h-4 text-[#0E5791]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Odette School of Business &bull; Board of Trustees Mandate</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Investment Policy Statement <span className="text-[#0E5791]">(IPS)</span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                {IPS_METADATA.title} &mdash; Governance, Terms of Reference, Strategic Asset Allocation Bands, and Risk Constraints established for prudent management of the Fund.
              </p>

              {/* Document metadata pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/90 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Formally Approved: <strong className="text-slate-800">{IPS_METADATA.approvalDate}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/90 font-medium">
                  Document Date: <strong className="text-slate-800">{IPS_METADATA.documentDate}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/90 font-medium">
                  Structure: <strong className="text-slate-800">Expendable Trust (Univ. of Windsor)</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-[#0E5791] border border-blue-200/80 font-bold">
                  Target Return: 5.0% Net
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
              <Link
                href="/simulator"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#0E5791] hover:bg-[#072F50] text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Open Trade Simulator</span>
              </Link>

              <Link
                href="/portfolio-overview"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Live Portfolio Overview</span>
              </Link>
            </div>
          </div>
        </section>

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
                  Unable to pull live portfolio holdings for IPS compliance evaluation ({loadError}). Mock fallback data has been disabled so database issues are clearly visible.
                </p>
              </div>
            </div>
            <button
              onClick={() => loadData()}
              className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shrink-0 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Retry Database Sync</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LIVE PORTFOLIO COMPLIANCE STATUS BAR */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Live Portfolio IPS Compliance Monitor
                </h2>
                {isLoadingHoldings ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 animate-pulse">
                    Evaluating...
                  </span>
                ) : compliance.isCompliant ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    All IPS Rules Satisfied
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    {compliance.alerts.filter((a) => a.type === "violation").length} Rebalancing Trigger(s)
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Real-time check of {holdings.length} consolidated positions ({formatCurrency(compliance.totalMarketValue)} total fund value) against IPS mandate limits.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-xs font-medium text-slate-400 block">Compliance Score</span>
                <span className="text-2xl font-extrabold text-[#0E5791]">
                  {compliance.score}<span className="text-sm font-medium text-slate-400">/100</span>
                </span>
              </div>
              <Link
                href="/simulator"
                className="px-4 py-2.5 rounded-xl bg-blue-50 text-[#0E5791] hover:bg-blue-100 text-xs font-bold border border-blue-100 transition-all"
              >
                Rebalance in Simulator &rarr;
              </Link>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
            
            {/* 1. Equity Allocation */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
                  <span>Equities Allocation</span>
                  <span className="font-semibold text-slate-700">Target 63% [56% - 70%]</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {compliance.assetMix.equity.percent.toFixed(1)}%
                  </span>
                  <span className="text-xs text-slate-500">
                    ({formatCurrency(compliance.assetMix.equity.value)})
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      compliance.assetMix.equity.status === "violation"
                        ? "bg-rose-500"
                        : compliance.assetMix.equity.status === "warning"
                        ? "bg-amber-500"
                        : "bg-[#0E5791]"
                    }`}
                    style={{ width: `${Math.min(100, compliance.assetMix.equity.percent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>Min 56%</span>
                  <span>Target 63%</span>
                  <span>Max 70%</span>
                </div>
              </div>
            </div>

            {/* 2. Fixed Income Allocation */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
                  <span>Fixed Income</span>
                  <span className="font-semibold text-slate-700">Target 37% [30% - 44%]</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {compliance.assetMix.fixedIncome.percent.toFixed(1)}%
                  </span>
                  <span className="text-xs text-slate-500">
                    ({formatCurrency(compliance.assetMix.fixedIncome.value)})
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      compliance.assetMix.fixedIncome.status === "violation"
                        ? "bg-rose-500"
                        : compliance.assetMix.fixedIncome.status === "warning"
                        ? "bg-amber-500"
                        : "bg-emerald-600"
                    }`}
                    style={{ width: `${Math.min(100, compliance.assetMix.fixedIncome.percent * (100 / 50))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>Min 30%</span>
                  <span>Target 37%</span>
                  <span>Max 44%</span>
                </div>
              </div>
            </div>

            {/* 3. Single Stock Concentration */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
                  <span>Max Stock Concentration</span>
                  <span className="font-semibold text-slate-700">Limit &le; 10.0%</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {compliance.singleStockLimit.highestStock?.percent.toFixed(1) || 0}%
                  </span>
                  <span className="text-xs font-semibold text-slate-600 truncate max-w-[110px]">
                    {compliance.singleStockLimit.highestStock?.ticker || "None"}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (compliance.singleStockLimit.highestStock?.percent || 0) > 10.0
                        ? "bg-rose-500"
                        : (compliance.singleStockLimit.highestStock?.percent || 0) > 8.5
                        ? "bg-amber-500"
                        : "bg-[#0E5791]"
                    }`}
                    style={{
                      width: `${Math.min(100, ((compliance.singleStockLimit.highestStock?.percent || 0) / 12) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>0%</span>
                  <span className="text-slate-600 font-bold">10% Cap</span>
                  <span>12%</span>
                </div>
              </div>
            </div>

            {/* 4. Industry/Sector Concentration */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
                  <span>Max Equity Sector</span>
                  <span className="font-semibold text-slate-700">Limit &le; 25.0%</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {compliance.sectorLimit.highestSector?.percent.toFixed(1) || 0}%
                  </span>
                  <span className="text-xs font-semibold text-slate-600 truncate max-w-[110px]">
                    {compliance.sectorLimit.highestSector?.sector || "None"}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (compliance.sectorLimit.highestSector?.percent || 0) > 25.0
                        ? "bg-rose-500"
                        : (compliance.sectorLimit.highestSector?.percent || 0) > 22.0
                        ? "bg-amber-500"
                        : "bg-[#0E5791]"
                    }`}
                    style={{
                      width: `${Math.min(100, ((compliance.sectorLimit.highestSector?.percent || 0) / 30) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>0%</span>
                  <span className="text-slate-600 font-bold">25% Cap</span>
                  <span>30%</span>
                </div>
              </div>
            </div>

          </div>

          {/* Active Alerts Banner if any exist */}
          {compliance.alerts.length > 0 && (
            <div className="mt-5 space-y-2">
              {compliance.alerts.slice(0, 3).map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl text-xs flex items-start gap-3 border ${
                    alert.type === "violation"
                      ? "bg-rose-50/70 border-rose-200 text-rose-800"
                      : alert.type === "warning"
                      ? "bg-amber-50/70 border-amber-200 text-amber-800"
                      : "bg-blue-50/70 border-blue-200 text-blue-800"
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-md bg-white/80 shrink-0">
                    {alert.type}
                  </span>
                  <div className="flex-1">
                    <span className="font-bold">{alert.title}:</span> {alert.message}
                    <span className="block text-[11px] opacity-75 font-mono mt-0.5">
                      Source: {alert.rule}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* TAB CONTROLS & SEARCH BAR (Fixed Flex Layout - Icon Never Overlaps Text) */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs overflow-x-auto">
            {[
              { id: "all", label: "Executive Summary" },
              { id: "asset-allocation", label: "Asset Allocation & Returns" },
              { id: "constraints", label: "Investment Constraints" },
              { id: "governance", label: "Governance & Workflow" },
              { id: "policies", label: "Policies & Terms" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-[#0E5791] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar - Flex Container with Clear Gap */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-xs focus-within:ring-2 focus-within:ring-[#0E5791] focus-within:border-transparent transition-all w-full md:w-80">
            <svg
              className="w-4 h-4 text-slate-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search IPS rules, caps, limits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-0 p-0 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 px-1 shrink-0"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Search Results Notification Banner */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-[#0E5791]">
            <span>
              Showing rules and constraints matching: <strong>&ldquo;{searchQuery}&rdquo;</strong> ({filteredConstraints.length} results)
            </span>
            <button
              onClick={() => setSearchQuery("")}
              className="font-bold underline hover:text-[#072F50]"
            >
              Reset filter
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 1: EXECUTIVE SUMMARY & OBJECTIVES */}
        {/* ========================================================================= */}
        {(activeTab === "all" || activeTab === "policies") && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Fund Purpose & Core Objectives
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Section 1.0 - 3.0: Background, Nature of Fund, and Strategic Mission
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-[#0E5791] border border-blue-100 hidden sm:inline-block">
                Expendable Trust Mandate
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {IPS_OBJECTIVES.map((obj) => (
                <div
                  key={obj.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0E5791] flex items-center justify-center font-bold text-xs mb-3 border border-blue-100">
                      ✓
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{obj.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      {obj.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: ASSET ALLOCATION STRATEGY & RETURN TARGETS */}
        {/* ========================================================================= */}
        {(activeTab === "all" || activeTab === "asset-allocation") && (
          <section className="space-y-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Strategic Asset Mix & Return Profile
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Sections 4.0, 10.0, 12.0, 13.0 & 14.0: Target Allocation, Bands, Rebalancing, and Expenditure Limits
              </p>
            </div>

            {/* Asset Allocation Bands Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <h4 className="text-lg font-bold text-slate-900">
                  Target Asset Class Mix & Rebalancing Bands
                </h4>
                <span className="text-xs text-slate-500">
                  Low-to-medium risk range per OSC Fund Facts guidelines
                </span>
              </div>

              <div className="space-y-6">
                {IPS_ASSET_ALLOCATION.map((band) => (
                  <div key={band.key} className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{band.name}</span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-[#0E5791] border border-blue-100">
                          Target: {band.target}%
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-500">
                        Allowable Range: <strong>{band.min}% &ndash; {band.max}%</strong>
                      </span>
                    </div>

                    {/* Visual Range Bar */}
                    <div className="relative w-full h-8 bg-slate-100 rounded-xl overflow-hidden p-1 border border-slate-200">
                      {/* Permitted Band Area */}
                      <div
                        className="absolute top-1 bottom-1 bg-blue-100/70 border-x-2 border-blue-400 rounded-xs"
                        style={{
                          left: `${band.min}%`,
                          width: `${band.max - band.min}%`,
                        }}
                      />

                      {/* Target Indicator */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-[#0E5791] z-10"
                        style={{ left: `${band.target}%` }}
                        title={`Target: ${band.target}%`}
                      />

                      {/* Current Portfolio Actual Indicator */}
                      {compliance.assetMix && (
                        <div
                          className="absolute top-1 bottom-1 w-2.5 bg-emerald-500 rounded-xs z-20 shadow-xs"
                          style={{
                            left: `${Math.min(99, Math.max(0, compliance.assetMix[band.key].percent))}%`,
                          }}
                          title={`Current Fund Weight: ${compliance.assetMix[band.key].percent.toFixed(1)}%`}
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{band.description}</span>
                      <span className="shrink-0 font-medium text-slate-700 ml-4">
                        Current: <strong>{compliance.assetMix[band.key].percent.toFixed(1)}%</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rebalancing Directive Note */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 text-xs text-blue-900">
                <svg className="w-5 h-5 text-[#0E5791] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="leading-relaxed">
                  <strong>Mandatory Rebalancing Procedure (Section 14):</strong> Periodic rebalancing of asset class levels within the above ranges will be required as asset values change over time. Rebalancing maintains equity / fixed income exposures at target levels and controls downside portfolio risk.
                </div>
              </div>
            </div>

            {/* Return Targets & Expenditure Limits 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Return Goals */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-base font-bold text-slate-900">Return Goals (Section 4.0 & 12.0)</h4>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    5.0% Net Target
                  </span>
                </div>

                <div className="space-y-3">
                  {IPS_RETURN_TARGETS.map((ret, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800">{ret.title}</span>
                        <span className="font-extrabold text-[#0E5791] text-sm">{ret.target}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{ret.description}</p>
                      {ret.formula && (
                        <div className="mt-2 text-[11px] font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                          {ret.formula}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-xs text-slate-400">
                  Initial Fund Investment (Fall 2016): <strong>{IPS_METADATA.initialInvestmentFormatted}</strong>
                </div>
              </div>

              {/* Expenditure Guidelines */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-base font-bold text-slate-900">Expenditure Limits (Section 4.0)</h4>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Max 1.5% Annual Fee Drag
                  </span>
                </div>

                <div className="space-y-3">
                  {IPS_EXPENDITURES.map((exp, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800">{exp.type}</span>
                        <span className="font-extrabold text-amber-700 text-sm">
                          Max {exp.maxPercent}% / yr
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-100/80 text-xs text-slate-600 leading-relaxed">
                  <strong>Trustee Approval:</strong> Trustees approve an annual Budget for these expenditures. Actual expenditure types and procedures are governed by the Fund Disbursements Policy with dual-signature controls.
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: INVESTMENT CONSTRAINTS & PERMITTED ASSETS */}
        {/* ========================================================================= */}
        {(activeTab === "all" || activeTab === "constraints") && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Investment Constraints & Permitted Securities
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Section 15, 16 & 18: Security Eligibility, Concentration Limits, and Prohibited Instruments
                </p>
              </div>
              <span className="text-xs font-bold text-[#0E5791] bg-blue-50 px-3 py-1 rounded-xl border border-blue-100 self-start sm:self-auto">
                Strict Risk Boundaries
              </span>
            </div>

            {/* Constraint Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredConstraints.map((c) => (
                <div
                  key={c.id}
                  className={`p-5 rounded-3xl bg-white border transition-all flex flex-col justify-between ${
                    c.status === "Prohibited"
                      ? "border-rose-200/80 shadow-xs hover:border-rose-300"
                      : "border-slate-200/80 shadow-xs hover:border-blue-300"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {c.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          c.status === "Prohibited"
                            ? "bg-rose-100 text-rose-800"
                            : c.status === "Strict"
                            ? "bg-blue-100 text-blue-900"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{c.name}</h4>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono font-bold text-slate-800">
                      {c.limit}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{c.details}</p>
                  </div>

                  {c.exceptionNote && (
                    <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-amber-700 italic">
                      * {c.exceptionNote}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Permitted Investments Detailed Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Cash & Fixed Income */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Permitted Fixed Income & Cash (Section 16.1 & 16.2)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Quality requirements for debt instruments and liquidity management
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                    <span className="font-bold text-slate-800 block">
                      Cash & Short-Term Investments (R-1 Low Rating):
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      {IPS_PERMITTED_INVESTMENTS.cash.eligibleItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                    <span className="font-bold text-slate-800 block">
                      Fixed Income Securities (A Grade Rating or Higher):
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      {IPS_PERMITTED_INVESTMENTS.fixedIncome.eligibleItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Equities & Other Considerations */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    Permitted Equities & ESG Directives (Section 16.3 & 16.4)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Shares, ETFs, foreign exchange risk rules, and ethical compliance
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                    <span className="font-bold text-slate-800 block">
                      Equity Securities:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      {IPS_PERMITTED_INVESTMENTS.equities.eligibleItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                    <span className="font-bold text-slate-800 block">
                      FX Risk & ESG Mandates:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      {IPS_PERMITTED_INVESTMENTS.currencyAndEsg.eligibleItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: GOVERNANCE & 5-STEP TRADE EXECUTION FLOW */}
        {/* ========================================================================= */}
        {(activeTab === "all" || activeTab === "governance") && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Governance Structure & Trade Execution Pipeline
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Sections 6.0, 7.0, 8.0 & 9.0: Board of Trustees, Management Hierarchy, and Trade Approval Chain
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                7 Trustees &bull; OSB Dean Oversight
              </span>
            </div>

            {/* Visual 5-Step Order Execution Chain Diagram */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Trade Execution Process (Page 8 Official Workflow)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Strict multi-level separation of duties: student analysis to Dean delegated trading execution.
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-[#0E5791] border border-blue-100">
                  Dual-Control Authorization
                </span>
              </div>

              {/* Stepper Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                {IPS_GOVERNANCE.tradeWorkflow.map((step) => (
                  <div
                    key={step.step}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 relative group hover:bg-blue-50/50 hover:border-blue-200 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-6 h-6 rounded-full bg-[#0E5791] text-white flex items-center justify-center font-bold text-xs">
                          {step.step}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Step {step.step}</span>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0E5791] block">
                        {step.actor}
                      </span>
                      <h5 className="text-sm font-bold text-slate-900 mt-1">
                        {step.action}
                      </h5>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 text-[11px] font-medium text-slate-500">
                      To: <span className="text-slate-800 font-semibold">{step.recipient}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Board of Trustees & Reporting Cadence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Board Composition */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-base font-bold text-slate-900">
                    Board of Trustees Composition (Section 7.0)
                  </h4>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0E5791]">
                    7 Member Board
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Appointed by the OSB Dean for a term of no more than three (3) years. Trustees meet a minimum of four times annually.
                </p>

                <div className="space-y-2">
                  {IPS_GOVERNANCE.boardOfTrustees.composition.map((seat, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-800">{seat.seat}</span>
                      <span className="text-slate-500 text-right max-w-xs">{seat.requirement}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reporting & Regulatory Deadlines */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-base font-bold text-slate-900">
                    Formal Reporting Schedule (Section 9.0)
                  </h4>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    Annual & Semi-Annual
                  </span>
                </div>

                <div className="space-y-3">
                  {IPS_GOVERNANCE.reportingSchedule.map((rep, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex justify-between items-center font-bold text-slate-900">
                        <span>{rep.type}</span>
                        <span className="text-[#0E5791] text-[11px] font-mono">{rep.cadence}</span>
                      </div>
                      <p className="text-slate-500 text-xs">{rep.approval}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/70 text-xs text-blue-900 border border-blue-100">
                  <strong>Brokerage Custody:</strong> Securities held in safe custody through Canada&apos;s national securities depository (CDS). Discount brokerage account maintained by OSB and University of Windsor.
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 5: OPERATIONAL POLICIES & APPENDICES */}
        {/* ========================================================================= */}
        {(activeTab === "all" || activeTab === "policies") && (
          <section className="space-y-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Operational Policies & Governance Rules
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Appendices #1 & #2, Sections 19-22: Operating Policies, Disbursements Control, and Dissolution Terms
              </p>
            </div>

            {/* Operational Policies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {IPS_APPENDICES.map((app, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Appendix Policy #{idx + 1}
                  </span>
                  <h4 className="text-base font-bold text-slate-900">{app.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {app.summary}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
