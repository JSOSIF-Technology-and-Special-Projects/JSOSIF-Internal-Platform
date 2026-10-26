"use client";

import { useEffect, useState } from "react";
import { CORRELATION_PERIODS, MIN_CORRELATION_OBSERVATIONS, correlationInclusiveEndDate, correlationWindow, isCorrelationPeriod, resolveCorrelationWindow, type CorrelationCell, type CorrelationPeriod } from "@/lib/portfolio/correlation";
import StockCorrelationComparison from "./StockCorrelationComparison";

interface MatrixData {
  holdings: { symbol: string; name: string }[];
  matrix: CorrelationCell[][];
  startDate: string;
  endDate: string;
}

export default function CorrelationMatrix({ teamId, endpoint, emptyMessage, allowPdfExport = false }: {
  teamId: string;
  endpoint: string;
  emptyMessage: string;
  allowPdfExport?: boolean;
}) {
  const [period, setPeriod] = useState<CorrelationPeriod>("1y");
  const [customRange, setCustomRange] = useState<{ startDate: string; endDate: string } | null>(null);
  const [draftStart, setDraftStart] = useState("");
  const [draftEnd, setDraftEnd] = useState("");
  const [validationError, setValidationError] = useState("");
  const [data, setData] = useState<{ query: string; value: MatrixData } | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const query = period === "custom"
    ? customRange ? new URLSearchParams({ period, ...customRange }).toString() : null
    : new URLSearchParams({ period }).toString();
  const latestEnd = correlationInclusiveEndDate(correlationWindow().endDate);

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError("");
    if (!query) return () => controller.abort();
    async function load() {
      try {
        const response = await fetch(`${endpoint}?${query}`, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load correlations.");
        if (!controller.signal.aborted) setData({ query: query!, value: result });
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Unable to load correlations.");
      }
    }
    void load();
    return () => controller.abort();
  }, [endpoint, query, attempt]);

  const matrix = data?.query === query ? data.value : null;
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`correlation-period-${teamId}`} className="block text-xs font-bold text-slate-600 mb-1">History period</label>
        <select id={`correlation-period-${teamId}`} value={period} onChange={(event) => {
          const nextPeriod = event.target.value;
          if (!isCorrelationPeriod(nextPeriod)) return;
          if (nextPeriod === "custom") {
            const current = data?.value ?? correlationWindow();
            setDraftStart(current.startDate);
            setDraftEnd(correlationInclusiveEndDate(current.endDate));
            setCustomRange(null);
          }
          setPeriod(nextPeriod);
          setValidationError("");
          setError("");
        }} aria-describedby={`correlation-period-note-${teamId}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
          {CORRELATION_PERIODS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          <option value="custom">Custom dates</option>
        </select>
        <p id={`correlation-period-note-${teamId}`} className="mt-2 text-xs text-slate-500">Changing the period clears temporary comparison stocks.</p>
      </div>
      {period === "custom" && (
        <form onSubmit={(event) => {
          event.preventDefault();
          const result = resolveCorrelationWindow(new URLSearchParams({ period: "custom", startDate: draftStart, endDate: draftEnd }));
          if ("error" in result) {
            setValidationError(result.error);
            return;
          }
          setValidationError("");
          setError("");
          setCustomRange({ startDate: draftStart, endDate: draftEnd });
        }} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor={`correlation-start-${teamId}`} className="mb-1 block text-xs font-bold text-slate-600">Start date</label>
              <input id={`correlation-start-${teamId}`} type="date" value={draftStart} max={latestEnd} required onChange={(event) => { setDraftStart(event.target.value); setValidationError(""); }} aria-describedby={`correlation-custom-note-${teamId}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor={`correlation-end-${teamId}`} className="mb-1 block text-xs font-bold text-slate-600">End date</label>
              <input id={`correlation-end-${teamId}`} type="date" value={draftEnd} min={draftStart || undefined} max={latestEnd} required onChange={(event) => { setDraftEnd(event.target.value); setValidationError(""); }} aria-describedby={`correlation-custom-note-${teamId}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="rounded-xl bg-[#0E5791] px-4 py-2 text-sm font-bold text-white">Apply dates</button>
          </div>
          <p id={`correlation-custom-note-${teamId}`} className="text-xs text-slate-500">Both dates are included. Choose an end date on or before {latestEnd}. At least {MIN_CORRELATION_OBSERVATIONS} matching daily returns are needed for each pair.</p>
          {validationError && <p role="alert" className="text-sm text-red-600">{validationError}</p>}
        </form>
      )}
      {error ? <div role="alert"><p className="text-sm text-red-600">{error}</p><button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-3 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">Try again</button></div>
        : !query ? <p className="text-sm text-slate-500">Choose your dates and select Apply dates to load the matrix.</p>
        : !matrix ? <p role="status" className="text-sm text-slate-500">Loading historical returns…</p>
        : matrix.holdings.length === 0 ? <p className="text-sm text-slate-500">{emptyMessage}</p>
        : <StockCorrelationComparison key={`${query}-${matrix.startDate}-${matrix.endDate}`} teamId={teamId} period={period} comparisonEndpoint={endpoint} allowPdfExport={allowPdfExport} {...matrix} />}
    </div>
  );
}
