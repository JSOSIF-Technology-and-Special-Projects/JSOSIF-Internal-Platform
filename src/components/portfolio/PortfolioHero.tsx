"use client";

import React from "react";
import Link from "next/link";

interface PortfolioHeroProps {
  lastUpdated: string;
  isLive: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  totalHoldings: number;
  totalTeams: number;
}

export default function PortfolioHero({
  lastUpdated,
  isLive,
  onRefresh,
  isRefreshing,
  totalHoldings,
  totalTeams,
}: PortfolioHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#072F50] via-[#0E5791] to-[#1B6CA8] text-white p-8 md:p-10 shadow-xl mb-8">
      {/* Decorative background glow circles */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-400 opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-24 w-80 h-80 rounded-full bg-teal-400 opacity-10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          {/* Status pill & metadata */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-md border border-white/15 text-white">
              <span
                className={`w-2 h-2 rounded-full ${
                  isLive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              {isLive ? "Market Data Active" : "Reference Data Mode"}
            </span>

            <span className="text-xs text-white/70 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
              Updated: {lastUpdated}
            </span>

            <span className="text-xs text-white/70 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
              CAD Currency Base
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
            Fund Portfolio Overview
          </h1>
          <p className="text-white/80 max-w-2xl text-sm sm:text-base leading-relaxed">
            Consolidated active holdings, sector allocations, and live performance metrics
            across all {totalTeams} JSOSIF investment research divisions.
          </p>
        </div>

        {/* Quick actions & stats */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-medium text-sm backdrop-blur-md border border-white/20 transition-all disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{isRefreshing ? "Refreshing..." : "Refresh Quotes"}</span>
          </button>

          <Link
            href="/simulator"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-white text-[#0E5791] hover:bg-blue-50 shadow-md transition-all active:scale-95"
          >
            <svg className="w-4 h-4 text-[#0E5791]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>Trade Simulator</span>
          </Link>

          <Link
            href="/teams"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white active:scale-95 font-semibold text-sm backdrop-blur-md border border-white/20 transition-all"
          >
            <span>Explore Teams</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Mini quick summary bar */}
      <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-xs uppercase text-white/60 font-semibold tracking-wider">
            Total Positions
          </p>
          <p className="text-xl font-bold mt-0.5">{totalHoldings} Equities</p>
        </div>
        <div>
          <p className="text-xs uppercase text-white/60 font-semibold tracking-wider">
            Investment Teams
          </p>
          <p className="text-xl font-bold mt-0.5">{totalTeams} Teams</p>
        </div>
        <div>
          <p className="text-xs uppercase text-white/60 font-semibold tracking-wider">
            Asset Class
          </p>
          <p className="text-xl font-bold mt-0.5">Equities & REITs</p>
        </div>
        <div>
          <p className="text-xs uppercase text-white/60 font-semibold tracking-wider">
            Exchanges
          </p>
          <p className="text-xl font-bold mt-0.5">TSX, NYSE, NASDAQ</p>
        </div>
      </div>
    </div>
  );
}
