"use client";

import { useRef, useState } from "react";
import { extendCorrelationMatrix, MIN_CORRELATION_OBSERVATIONS, type CorrelationCell } from "@/lib/portfolio/correlation";

interface Holding { symbol: string; name: string; temporary?: boolean }
interface Comparison {
  symbol: string;
  startDate: string;
  endDate: string;
  self: CorrelationCell;
  comparisons: (CorrelationCell & { symbol: string; name: string })[];
}

function cellColor(value: number | null) {
  if (value === null) return "#f1f5f9";
  const target = value < 0 ? [190, 65, 75] : [14, 87, 145];
  return `rgb(${target.map((channel) => Math.round(255 + (channel - 255) * Math.abs(value))).join(",")})`;
}

export default function StockCorrelationComparison({ teamId, holdings, matrix, startDate, endDate }: {
  teamId: string; holdings: Holding[]; matrix: CorrelationCell[][]; startDate: string; endDate: string;
}) {
  const [symbol, setSymbol] = useState("");
  const [candidate, setCandidate] = useState<Comparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const pending = useRef(false);

  async function addStock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ticker = symbol.trim().toUpperCase();
    if (pending.current || !ticker) return;
    setError("");
    setMessage("");
    if (holdings.some((holding) => holding.symbol === ticker) || candidate?.symbol === ticker) {
      setMessage(`${ticker} is already in the chart.`);
      return;
    }
    pending.current = true;
    setLoading(true);
    try {
      const response = await fetch(`/api/teams/${encodeURIComponent(teamId)}/correlation?symbol=${encodeURIComponent(ticker)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to add this stock.");
      if (data.startDate !== startDate || data.endDate !== endDate) throw new Error("The history window has changed. Refresh this page and try again.");
      setCandidate(data);
      setSymbol("");
      setMessage(`${data.symbol} added to the chart temporarily.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add this stock.");
    } finally {
      pending.current = false;
      setLoading(false);
    }
  }

  const displayedHoldings: Holding[] = candidate ? [...holdings, { symbol: candidate.symbol, name: candidate.symbol, temporary: true }] : holdings;
  const displayedMatrix = candidate ? extendCorrelationMatrix(matrix, holdings.map((holding) => candidate.comparisons.find((comparison) => comparison.symbol === holding.symbol) || { value: null, observations: 0 }), candidate.self) : matrix;
  const unavailable = displayedHoldings.filter((_, index) => displayedMatrix[index][index].value === null).map((holding) => holding.symbol);
  const hasComparison = displayedMatrix.some((row, index) => row.some((cell, column) => column !== index && cell.value !== null));

  return (
    <div className="space-y-4">
      <form onSubmit={addStock} className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <label htmlFor={`matrix-ticker-${teamId}`} className="block text-xs font-bold text-slate-600 mb-1">Add a stock to the chart</label>
          <input id={`matrix-ticker-${teamId}`} value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder="AAPL or SHOP.TO" maxLength={20} required disabled={loading} autoCapitalize="characters" autoComplete="off" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" disabled={loading || !symbol.trim()} className="rounded-xl bg-[#0E5791] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{loading ? "Adding…" : "Add to chart"}</button>
        {candidate && <button type="button" disabled={loading} onClick={() => { setCandidate(null); setMessage(""); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm">Remove {candidate.symbol}</button>}
      </form>
      <p className="text-xs text-slate-500">The added stock is temporary and only appears in this chart. Adding another stock replaces it.</p>
      {loading && <p role="status" className="text-sm text-slate-500">Loading historical returns…</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {message && <p role="status" className="text-sm text-slate-600">{message}</p>}
      <p className="text-sm text-slate-500">
        Pearson correlation of daily adjusted returns over the past year, in each holding’s trading currency. FX movements into CAD are excluded.
      </p>
      <p className="text-xs text-slate-400">{startDate} to {endDate} (end exclusive) · Yahoo Finance · At least {MIN_CORRELATION_OBSERVATIONS} matching observations per pair</p>
      {!hasComparison && <p className="text-sm text-slate-500">There isn’t enough overlapping price history to compare these holdings yet.</p>}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Correlation matrix for the team’s holdings. Values range from negative one to positive one. N/A means insufficient history or no variation in returns.</caption>
          <thead>
            <tr>
              <th scope="col" className="bg-slate-50 p-3 text-left text-xs font-bold text-slate-600">Holding</th>
              {displayedHoldings.map((holding) => <th scope="col" key={holding.symbol} title={holding.name} className="min-w-20 whitespace-nowrap bg-slate-50 p-3 font-bold text-slate-600">{holding.symbol}{holding.temporary && <span className="ml-1 text-[10px] text-blue-600">(preview)</span>}</th>)}
            </tr>
          </thead>
          <tbody>
            {displayedHoldings.map((holding, row) => (
              <tr key={holding.symbol}>
                <th scope="row" title={holding.name} className="whitespace-nowrap border-t border-slate-200 bg-slate-50 p-3 text-left font-bold text-slate-600">{holding.symbol}{holding.temporary && <span className="ml-1 text-[10px] text-blue-600">(preview)</span>}</th>
                {displayedMatrix[row].map((cell, column) => (
                  <td
                    key={displayedHoldings[column].symbol}
                    title={`${holding.symbol} / ${displayedHoldings[column].symbol}: ${cell.value === null ? "Unavailable: insufficient history or no return variation" : cell.value.toFixed(4)} (${cell.observations} matching observations)`}
                    className="border border-white/50 p-3 text-center font-semibold tabular-nums"
                    style={{ backgroundColor: cellColor(cell.value), color: cell.value !== null && Math.abs(cell.value) > 0.65 ? "white" : "#334155" }}
                  >
                    {cell.value === null ? "N/A" : cell.value.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>−1: opposite movement</span>
        <span className="h-3 w-32 rounded" style={{ background: "linear-gradient(to right, #be414b, #ffffff, #0e5791)" }} aria-hidden="true" />
        <span>0: no linear relationship</span>
        <span>+1: same movement</span>
      </div>
      {unavailable.length > 0 && <p className="text-xs text-slate-500">Insufficient usable history or no return variation: {unavailable.join(", ")}. Some bonds or delisted holdings may have no available history.</p>}
    </div>
  );
}
