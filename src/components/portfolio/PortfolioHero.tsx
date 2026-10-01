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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B2A4A] to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800/80 mb-6">
      {/* Subtle modern ambient background glow */}
      <div className="absolute top-0 right-1/4 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          {/* Status pill & metadata chips */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-white">
              <span
                className={`w-2 h-2 rounded-full ${
                  isLive ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                }`}
              />
              {isLive ? "Live Database & Market Quotes" : "Database Offline"}
            </span>

            {lastUpdated && (
              <span className="text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
                Updated: {lastUpdated}
              </span>
            )}

            <span className="text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
              CAD Base Currency
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">
            Fund Portfolio Overview
          </h1>
          <p className="text-slate-300 max-w-2xl text-xs sm:text-sm leading-relaxed">
            Consolidated active holdings, sector allocations, and live performance metrics
            across all {totalTeams} JSOSIF investment research divisions.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-semibold text-xs backdrop-blur-md border border-white/15 transition-all disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{isRefreshing ? "Refreshing..." : "Refresh Quotes"}</span>
          </button>

          <Link
            href="/simulator"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>Trade Simulator</span>
          </Link>

          <Link
            href="/ips"
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white active:scale-95 font-semibold text-xs backdrop-blur-md border border-white/10 transition-all"
          >
            <svg className="w-3.5 h-3.5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>IPS Mandate</span>
          </Link>

          <Link
            href="/teams"
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white active:scale-95 font-semibold text-xs backdrop-blur-md border border-white/10 transition-all"
          >
            <span>Explore Teams</span>
            <svg
              className="w-3.5 h-3.5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
