import Link from "next/link";
import { watchlistDate, watchlistMoney, watchlistStatusLabel, type WatchlistEntry, type WatchlistQuote } from "@/lib/watchlist/types";

const statusColors = { watching: "bg-slate-100 text-slate-700", researching: "bg-blue-50 text-blue-800", ready_to_pitch: "bg-emerald-50 text-emerald-800", archived: "bg-amber-50 text-amber-900" };
export default function WatchlistCard({ entry, teamName, quote, quoteLoading, canManage, busy, onEdit, onArchive }: {
  entry: WatchlistEntry; teamName: string; quote?: WatchlistQuote | null; quoteLoading: boolean;
  canManage: boolean; busy: boolean; onEdit: () => void; onArchive: () => void;
}) {
  const atTarget = entry.targetPriceCad !== null && quote?.priceCad !== null && quote?.priceCad !== undefined && quote.priceCad <= entry.targetPriceCad;
  return <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-xs font-semibold text-[#0E5791]">{teamName}</p><h2 className="mt-1 text-lg font-bold text-slate-900">{entry.symbol}</h2><p className="text-sm text-slate-600">{entry.companyName}</p>{entry.sector && <p className="mt-1 text-xs text-slate-500">{entry.sector}</p>}</div>
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[entry.status]}`}>{watchlistStatusLabel(entry.status)}</span>
    </div>
    <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
      <div><p className="text-xs text-slate-500">Latest price · CAD</p><p className="mt-1 font-bold tabular-nums">{quote?.priceCad !== null && quote?.priceCad !== undefined ? watchlistMoney(quote.priceCad) : quoteLoading ? "Loading…" : "Unavailable"}</p>
        {quote?.currency === "USD" && <p className="mt-1 text-xs text-slate-500">{watchlistMoney(quote.price, "USD")} USD{quote.priceCad === null ? " · CAD conversion unavailable" : ""}</p>}
        {quote?.changePercent !== null && quote?.changePercent !== undefined && <p className={`mt-1 text-xs font-semibold ${quote.changePercent >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{quote.changePercent > 0 ? "+" : ""}{quote.changePercent.toFixed(2)}% session change</p>}
      </div>
      <div><p className="text-xs text-slate-500">Target price · CAD</p><p className="mt-1 font-bold tabular-nums">{entry.targetPriceCad === null ? "Not set" : watchlistMoney(entry.targetPriceCad)}</p>{atTarget && <p className="mt-1 text-xs font-semibold text-emerald-700">At or below target</p>}</div>
    </div>
    <div className="text-sm text-slate-700"><p className="whitespace-pre-wrap break-words">{entry.notes.length > 220 ? `${entry.notes.slice(0, 220)}…` : entry.notes}</p>{entry.notes.length > 220 && <details className="mt-2"><summary className="cursor-pointer font-semibold text-[#0E5791]">Read full research note</summary><p className="mt-2 whitespace-pre-wrap break-words">{entry.notes}</p></details>}</div>
    <div className="mt-auto border-t border-slate-100 pt-3 text-xs text-slate-500"><p>Added by {entry.authorName} · {watchlistDate(entry.createdAt)} ET</p>{entry.updatedAt !== entry.createdAt && <p className="mt-1">Updated by {entry.updatedByName} · {watchlistDate(entry.updatedAt)} ET</p>}
      {quote && <p className="mt-1">{quote.marketTime ? `Market quote: ${watchlistDate(quote.marketTime)} ET` : `Price fetched: ${watchlistDate(quote.fetchedAt)} ET`}</p>}
    </div>
    <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
      {entry.status !== "archived" && <Link href={`/simulator?${new URLSearchParams({ team: teamName, ticker: entry.symbol, sector: entry.sector })}`} className="rounded-lg bg-[#0E5791] px-3 py-2 text-white hover:bg-[#084477]">Simulate trade</Link>}
      {canManage && <><button type="button" disabled={busy} onClick={onEdit} className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 disabled:opacity-50">Edit</button><button type="button" disabled={busy} onClick={onArchive} className="px-1 py-2 text-slate-600 disabled:opacity-50">{entry.status === "archived" ? "Restore" : "Archive"}</button></>}
    </div>
  </article>;
}
