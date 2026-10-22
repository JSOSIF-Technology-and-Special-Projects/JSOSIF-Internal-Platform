"use client";

import { useEffect, useState } from "react";
import type { CorrelationCell } from "@/lib/portfolio/correlation";
import StockCorrelationComparison from "./StockCorrelationComparison";

interface PortfolioCorrelation {
  holdings: { symbol: string; name: string }[];
  matrix: CorrelationCell[][];
  startDate: string;
  endDate: string;
}

export default function FundCorrelationMatrix() {
  const [data, setData] = useState<PortfolioCorrelation | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError("");
    async function load() {
      try {
        const response = await fetch("/api/portfolio/correlation", { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load portfolio correlations.");
        if (!controller.signal.aborted) setData(result);
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Unable to load portfolio correlations.");
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);
  return <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 space-y-5">
    <div><h2 className="text-xl font-bold text-slate-900">Whole Portfolio Correlation Matrix</h2><p className="mt-2 text-sm text-slate-500">Compare current holdings across all divisions, excluding fixed income and cash. Repeated tickers are combined, and unavailable history is shown as N/A.</p></div>
    {error ? <div role="alert"><p className="text-sm text-red-600">{error}</p><button onClick={() => setAttempt((value) => value + 1)} className="mt-3 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">Try again</button></div>
      : !data ? <p role="status" className="text-sm text-slate-500">Loading portfolio price history…</p>
      : data.holdings.length === 0 ? <p className="text-sm text-slate-500">There are no current holdings to compare after excluding fixed income and cash.</p>
      : <StockCorrelationComparison teamId="whole-portfolio" comparisonEndpoint="/api/portfolio/correlation" {...data} />}
  </section>;
}
