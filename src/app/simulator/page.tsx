"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TradeSimulator from "@/components/portfolio/TradeSimulator";
import { PortfolioHolding } from "@/data/fallbackHoldings";

function SimulatorContent() {
  const searchParams = useSearchParams();
  const initialTeam = searchParams?.get("team") || undefined;

  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/holdings");
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || errorData?.error || `Holdings API returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setHoldings(data);
      } else {
        throw new Error("Invalid response format received from holdings API");
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Failed to load live holdings from database";
      console.error("Failed to load live holdings from database:", err);
      setLoadError(msg);
      setHoldings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalMarketValue = holdings.reduce(
    (sum, h) => sum + (h.marketValue || h.shares * (h.currentPrice || h.averageCost || 0)),
    0
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 pt-32 sm:pt-36">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-44 rounded-3xl bg-gray-200" />
          <div className="h-96 rounded-3xl bg-gray-200" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Context Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <Link
              href="/portfolio-overview"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#0E5791] hover:text-[#072F50] bg-blue-50/70 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-100 transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Portfolio Overview</span>
            </Link>

            <span className="text-slate-300 hidden sm:inline">•</span>

            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Active against {holdings.length} consolidated portfolio positions
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Pricing
            </span>
            <span className="px-2.5 py-1 rounded-full font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              CAD Base
            </span>
            <Link
              href="/ips"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-[#0E5791] hover:bg-blue-50 border border-blue-200/70 transition-all"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>IPS Mandate</span>
            </Link>
          </div>
        </div>

        {/* Error Notification Banner */}
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
                  Unable to pull portfolio holdings from database ({loadError}). Mock fallback data has been disabled so database issues are clearly visible.
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

        {/* Trade Simulator */}
        <TradeSimulator
          holdings={holdings}
          totalMarketValue={totalMarketValue}
          initialTeam={initialTeam}
        />
      </div>
    </main>
  );
}

export default function StandaloneSimulatorPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 pt-32 sm:pt-36">
          <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
            <div className="h-44 rounded-3xl bg-gray-200" />
            <div className="h-96 rounded-3xl bg-gray-200" />
          </div>
        </main>
      }
    >
      <SimulatorContent />
    </Suspense>
  );
}
