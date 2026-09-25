"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TradeSimulator from "@/components/portfolio/TradeSimulator";
import { fallbackHoldings, PortfolioHolding } from "@/data/fallbackHoldings";

function SimulatorContent() {
  const searchParams = useSearchParams();
  const initialTeam = searchParams?.get("team") || undefined;

  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/holdings");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setHoldings(data);
            return;
          }
        }
        setHoldings(fallbackHoldings);
      } catch (err) {
        console.warn("Failed to load live holdings, using fallback data:", err);
        setHoldings(fallbackHoldings);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

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
    <main className="min-h-screen bg-[#F8FAFC] text-gray-900 p-4 sm:p-6 lg:p-8 pt-28 sm:pt-36">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Context Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/portfolio-overview"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#0E5791] hover:text-[#072F50] bg-blue-50/70 hover:bg-blue-100 px-3.5 py-2 rounded-xl border border-blue-100 transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Portfolio Overview</span>
            </Link>

            <span className="text-gray-300 hidden sm:inline">|</span>

            <span className="text-xs text-gray-500 font-medium hidden sm:inline">
              Simulating against {holdings.length} consolidated portfolio positions
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Quotes Engine Active
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
              CAD Base
            </span>
          </div>
        </div>

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
