"use client";

import { useEffect, useRef, useState } from "react";
import { correlationInclusiveEndDate, extendCorrelationMatrix, MAX_ADDED_CORRELATION_STOCKS, MIN_CORRELATION_OBSERVATIONS, type CorrelationCell, type CorrelationPeriod } from "@/lib/portfolio/correlation";

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

export default function StockCorrelationComparison({ teamId, holdings, matrix, startDate, endDate, period = "1y", comparisonEndpoint, allowPdfExport = false }: {
  teamId: string; holdings: Holding[]; matrix: CorrelationCell[][]; startDate: string; endDate: string; period?: CorrelationPeriod; comparisonEndpoint?: string; allowPdfExport?: boolean;
}) {
  const [symbol, setSymbol] = useState("");
  const [candidates, setCandidates] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const pending = useRef(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [selectedCell, setSelectedCell] = useState<{ left: Holding; right: Holding; cell: CorrelationCell } | null>(null);
  const detailDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (selectedCell) detailDialog.current?.showModal();
  }, [selectedCell]);

  async function addStock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ticker = symbol.trim().toUpperCase();
    if (pending.current || !ticker) return;
    setError("");
    setMessage("");
    if (holdings.some((holding) => holding.symbol === ticker) || candidates.some((candidate) => candidate.symbol === ticker)) {
      setMessage(`${ticker} is already in the chart.`);
      return;
    }
    if (candidates.length >= MAX_ADDED_CORRELATION_STOCKS) {
      setError(`You can add up to ${MAX_ADDED_CORRELATION_STOCKS} stocks. Remove one before adding another.`);
      return;
    }
    pending.current = true;
    setLoading(true);
    try {
      const query = new URLSearchParams({ symbol: ticker, period });
      if (period === "custom") {
        query.set("startDate", startDate);
        query.set("endDate", correlationInclusiveEndDate(endDate));
      }
      candidates.forEach((candidate) => query.append("compare", candidate.symbol));
      const response = await fetch(`${comparisonEndpoint || `/api/teams/${encodeURIComponent(teamId)}/correlation`}?${query}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to add this stock.");
      if (data.startDate !== startDate || data.endDate !== endDate) throw new Error("The history window has changed. Refresh this page and try again.");
      setCandidates((previous) => [...previous, data]);
      setSymbol("");
      setMessage(`${data.symbol} added to the chart temporarily.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add this stock.");
    } finally {
      pending.current = false;
      setLoading(false);
    }
  }

  const displayedHoldings: Holding[] = [...holdings];
  let displayedMatrix = matrix;
  for (const candidate of candidates) {
    displayedMatrix = extendCorrelationMatrix(displayedMatrix, displayedHoldings.map((holding) => candidate.comparisons.find((comparison) => comparison.symbol === holding.symbol) || { value: null, observations: 0 }), candidate.self);
    displayedHoldings.push({ symbol: candidate.symbol, name: candidate.symbol, temporary: true });
  }
  const atLimit = candidates.length >= MAX_ADDED_CORRELATION_STOCKS;
  const unavailable = displayedHoldings.filter((_, index) => displayedMatrix[index][index].value === null).map((holding) => holding.symbol);
  const hasComparison = displayedMatrix.some((row, index) => row.some((cell, column) => column !== index && cell.value !== null));

  async function downloadPdf() {
    setExporting(true);
    setExportError("");
    try {
      const { exportCorrelationPdf } = await import("@/lib/portfolio/exportCorrelationPdf");
      await exportCorrelationPdf({ holdings: displayedHoldings, matrix: displayedMatrix, startDate, endDate });
    } catch {
      setExportError("Unable to export the PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      {allowPdfExport && <div className="flex justify-end"><button type="button" onClick={downloadPdf} disabled={loading || exporting || displayedHoldings.length === 0} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-[#0E5791] hover:bg-blue-50 disabled:opacity-50">{exporting ? "Exporting…" : "Export to PDF"}</button></div>}
      {exportError && <p role="alert" className="text-sm text-red-600">{exportError}</p>}
      <form onSubmit={addStock} className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <label htmlFor={`matrix-ticker-${teamId}`} className="block text-xs font-bold text-slate-600 mb-1">Add a stock to the chart</label>
          <input id={`matrix-ticker-${teamId}`} value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder="AAPL or SHOP.TO" maxLength={20} required disabled={loading || atLimit} autoCapitalize="characters" autoComplete="off" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" disabled={loading || atLimit || !symbol.trim()} className="rounded-xl bg-[#0E5791] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{loading ? "Adding…" : "Add to chart"}</button>
      </form>
      <p className="text-xs text-slate-500">{candidates.length}/{MAX_ADDED_CORRELATION_STOCKS} added stocks. Added stocks are temporary and only appear in this chart.{atLimit && " Remove a stock to add another."}</p>
      {candidates.length > 0 && <div className="flex flex-wrap gap-2" aria-label="Added stocks">
        {candidates.map((candidate) => <button key={candidate.symbol} type="button" disabled={loading} onClick={() => { setCandidates((previous) => previous.filter((stock) => stock.symbol !== candidate.symbol)); setError(""); setMessage(`${candidate.symbol} removed from the chart.`); }} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold disabled:opacity-50" aria-label={`Remove ${candidate.symbol}`}>{candidate.symbol} ×</button>)}
      </div>}
      {loading && <p role="status" className="text-sm text-slate-500">Loading historical returns…</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {message && <p role="status" className="text-sm text-slate-600">{message}</p>}
      <p className="text-sm text-slate-500">
        Pearson correlation of daily adjusted returns over the selected period, in each holding’s trading currency. FX movements into CAD are excluded.
      </p>
      <p className="text-xs text-slate-400">{startDate} to {correlationInclusiveEndDate(endDate)} · Yahoo Finance · At least {MIN_CORRELATION_OBSERVATIONS} matching observations per pair</p>
      {!hasComparison && <p className="text-sm text-slate-500">There isn’t enough overlapping price history to compare these holdings yet.</p>}
      <p className="text-xs text-slate-500">Scroll to explore the matrix. Ticker headers stay visible. Select any value for pair details and sample size.</p>
      <div role="region" aria-label="Scrollable correlation matrix" tabIndex={0} className="max-h-[65vh] w-full overflow-auto rounded-2xl border border-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <caption className="sr-only">Correlation matrix for portfolio holdings. Values range from negative one to positive one. N/A means insufficient history or no variation in returns.</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 top-0 z-30 border-b border-r border-slate-200 bg-slate-50 p-3 text-left text-xs font-bold text-slate-600">Holding</th>
              {displayedHoldings.map((holding) => <th scope="col" key={holding.symbol} title={holding.name} className="sticky top-0 z-20 min-w-20 whitespace-nowrap border-b border-slate-200 bg-slate-50 p-3 font-bold text-slate-600">{holding.symbol}{holding.temporary && <span className="ml-1 text-[10px] text-blue-600">(preview)</span>}</th>)}
            </tr>
          </thead>
          <tbody>
            {displayedHoldings.map((holding, row) => (
              <tr key={holding.symbol}>
                <th scope="row" title={holding.name} className="sticky left-0 z-10 whitespace-nowrap border-b border-r border-slate-200 bg-slate-50 p-3 text-left font-bold text-slate-600">{holding.symbol}{holding.temporary && <span className="ml-1 text-[10px] text-blue-600">(preview)</span>}</th>
                {displayedMatrix[row].map((cell, column) => (
                  <td
                    key={displayedHoldings[column].symbol}
                    title={`${holding.symbol} / ${displayedHoldings[column].symbol}: ${cell.value === null ? "Unavailable: insufficient history or no return variation" : cell.value.toFixed(4)} (${cell.observations} matching observations)`}
                    className="border border-white/50 text-center font-semibold tabular-nums"
                    style={{ backgroundColor: cellColor(cell.value), color: cell.value !== null && Math.abs(cell.value) > 0.65 ? "white" : "#334155" }}
                  >
                    <button type="button" aria-haspopup="dialog" aria-label={`${holding.symbol} and ${displayedHoldings[column].symbol}: ${cell.value === null ? "unavailable" : cell.value.toFixed(4)}, ${cell.observations} matching observations. Open details.`} onClick={() => setSelectedCell({ left: holding, right: displayedHoldings[column], cell })} className="min-h-11 w-full min-w-20 p-3 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-slate-900 hover:brightness-90">
                      {cell.value === null ? "N/A" : cell.value.toFixed(2)}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dialog ref={detailDialog} onClose={() => setSelectedCell(null)} aria-labelledby={`correlation-detail-${teamId}`} className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl backdrop:bg-slate-900/40">
        {selectedCell && <div className="space-y-4">
          <h3 id={`correlation-detail-${teamId}`} className="text-lg font-bold">{selectedCell.left.symbol} / {selectedCell.right.symbol}</h3>
          <p className="text-sm text-slate-600">{selectedCell.left.name} · {selectedCell.right.name}</p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4"><dt>Correlation</dt><dd className="font-bold tabular-nums">{selectedCell.cell.value === null ? "N/A" : selectedCell.cell.value.toFixed(4)}</dd></div>
            <div className="flex justify-between gap-4"><dt>Matching daily returns</dt><dd className="font-bold tabular-nums">{selectedCell.cell.observations}</dd></div>
          </dl>
          {selectedCell.cell.value === null && <p className="text-sm text-slate-600">At least {MIN_CORRELATION_OBSERVATIONS} matching returns with price variation are needed.</p>}
          <p className="text-xs text-slate-500">{startDate} to {correlationInclusiveEndDate(endDate)}. Returns use each holding’s trading currency.</p>
          <button type="button" onClick={() => detailDialog.current?.close()} className="rounded-xl bg-[#0E5791] px-4 py-2 text-sm font-bold text-white">Close</button>
        </div>}
      </dialog>
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
