"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { WATCHLIST_STATUSES, canManageWatchlist, watchlistStatusLabel, watchlistSymbol, type WatchlistEntry, type WatchlistQuote, type WatchlistStatus, type WatchlistTeam, type WatchlistViewer } from "@/lib/watchlist/types";
import WatchlistCard from "./WatchlistCard";

interface Editor { entry: WatchlistEntry | null; teamId: string; symbol: string; sector: string; notes: string; target: string; status: WatchlistStatus }
type QuoteResults = Record<string, { quote: WatchlistQuote | null; error?: string }>;
const editorKey = (value: Editor) => JSON.stringify({ teamId: value.teamId, symbol: value.symbol, sector: value.sector, notes: value.notes, target: value.target, status: value.status });
export default function Watchlist({ initialTeam = "my" }: { initialTeam?: string }) {
  const [viewer, setViewer] = useState<WatchlistViewer | null>(null);
  const [teams, setTeams] = useState<WatchlistTeam[]>([]);
  const [records, setRecords] = useState<WatchlistEntry[]>([]);
  const [team, setTeam] = useState(initialTeam);
  const [status, setStatus] = useState("active");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);
  const [signInRequired, setSignInRequired] = useState(false);
  const [quotes, setQuotes] = useState<QuoteResults>({});
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [priceReload, setPriceReload] = useState(0);
  const [editor, setEditor] = useState<Editor | null>(null);
  const originalEditor = useRef("");
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const requestId = useRef<{ key: string; id: string } | null>(null);
  const form = useRef<HTMLElement>(null);

  useEffect(() => { const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300); return () => clearTimeout(timer); }, [searchInput]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setListError(""); setSignInRequired(false);
    fetch(`/api/watchlist?${new URLSearchParams({ team, status, search, page: String(page) })}`, { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        const result = await response.json();
        if (controller.signal.aborted) return;
        if (result.viewer) { setViewer(result.viewer); if (!result.viewer.teamId && team === "my") setTeam("all"); }
        if (result.teams) setTeams(result.teams);
        setSetupRequired(Boolean(result.setupRequired));
        setSignInRequired(response.status === 401);
        if (!response.ok) throw new Error(result.error || "Unable to load watchlist.");
        setRecords(result.data); setHasMore(result.hasMore);
      })
      .catch(error => { if (!controller.signal.aborted) { setRecords([]); setHasMore(false); setListError(error instanceof Error ? error.message : "Unable to load watchlist."); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [team, status, search, page, reload]);

  useEffect(() => {
    const controller = new AbortController();
    const symbols = [...new Set(records.map(entry => entry.symbol))];
    setQuotes({}); setQuoteError(""); setQuotesLoading(false);
    if (!symbols.length) return () => controller.abort();
    setQuotesLoading(true);
    fetch(`/api/watchlist/quotes?${new URLSearchParams({ symbols: symbols.join(",") })}`, { signal: controller.signal, cache: "no-store" })
      .then(async response => { const result = await response.json(); if (!response.ok) throw new Error(result.error || "Prices unavailable."); if (!controller.signal.aborted) { setQuotes(result.data); if (Object.values(result.data as QuoteResults).some(item => item.error)) setQuoteError("Some prices are unavailable. Your saved research is still available."); } })
      .catch(error => { if (!controller.signal.aborted) setQuoteError(error instanceof Error ? error.message : "Prices unavailable."); })
      .finally(() => { if (!controller.signal.aborted) setQuotesLoading(false); });
    return () => controller.abort();
  }, [records, priceReload]);

  const canAdd = Boolean(viewer && teams.length && (viewer.isAdmin || viewer.teamId));
  const canDiscard = () => !editor || editorKey(editor) === originalEditor.current || window.confirm("Discard unsaved watchlist changes?");
  function openEditor(entry: WatchlistEntry | null) {
    if (busy || !viewer || !canDiscard()) return;
    const teamId = entry?.teamId || (viewer.isAdmin && teams.some(item => item.id === team) ? team : viewer.teamId || teams[0]?.id || "");
    const value: Editor = { entry, teamId, symbol: entry?.symbol || "", sector: entry?.sector || "", notes: entry?.notes || "", target: entry?.targetPriceCad === null || entry?.targetPriceCad === undefined ? "" : String(entry.targetPriceCad), status: entry?.status || "watching" };
    setEditor(value); originalEditor.current = editorKey(value); requestId.current = null; setFormError(""); setActionError("");
    setTimeout(() => form.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }
  function closeEditor() { if (!busy && canDiscard()) { setEditor(null); setFormError(""); } }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor || pending.current) return;
    setFormError(""); setNotice("");
    const targetPriceCad = editor.target.trim() ? Number(editor.target) : null;
    if (!watchlistSymbol(editor.symbol) || (targetPriceCad !== null && (!Number.isFinite(targetPriceCad) || targetPriceCad <= 0))) { setFormError("Enter a valid ticker and a positive target price, or leave the target blank."); return; }
    const payload = { teamId: editor.teamId, symbol: editor.symbol, sector: editor.sector, notes: editor.notes, targetPriceCad, status: editor.status };
    const key = JSON.stringify(payload);
    if (requestId.current?.key !== key) requestId.current = { key, id: crypto.randomUUID() };
    pending.current = true; setBusy(true);
    try {
      const response = await fetch(editor.entry ? `/api/watchlist/${editor.entry.id}` : "/api/watchlist", { method: editor.entry ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, id: requestId.current.id, expectedUpdatedAt: editor.entry?.updatedAt }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save watchlist entry.");
      if (!editor.entry) { setTeam(editor.teamId); setStatus(editor.status === "archived" ? "archived" : "active"); setSearchInput(""); setSearch(""); }
      setEditor(null); setNotice(editor.entry ? "Watchlist entry updated." : "Company added to the team’s watchlist."); setPage(1); setReload(value => value + 1);
    } catch (error) { setFormError(error instanceof Error ? error.message : "Unable to save entry."); }
    finally { pending.current = false; setBusy(false); }
  }
  async function archive(entry: WatchlistEntry) {
    if (pending.current) return;
    if (editor?.entry?.id === entry.id && !canDiscard()) return;
    pending.current = true; setBusy(true); setActionError(""); setNotice("");
    try {
      const response = await fetch(`/api/watchlist/${entry.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notes: entry.notes, targetPriceCad: entry.targetPriceCad, status: entry.status === "archived" ? "watching" : "archived", expectedUpdatedAt: entry.updatedAt }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update entry.");
      if (editor?.entry?.id === entry.id) setEditor(null);
      setNotice(entry.status === "archived" ? "Entry restored to Watching." : "Entry archived. Its research notes are retained."); setPage(1); setReload(value => value + 1);
    } catch (error) { setActionError(error instanceof Error ? error.message : "Unable to update entry."); }
    finally { pending.current = false; setBusy(false); }
  }

  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6"><div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#0E5791]">Investment research</p><h1 className="mt-1 text-3xl font-bold">Watchlist</h1><p className="mt-2 text-sm text-slate-600">Team-owned research, visible across the fund.</p></div>{canAdd && <button type="button" disabled={busy || setupRequired} onClick={() => openEditor(null)} className="rounded-xl bg-[#0E5791] px-4 py-3 text-sm font-semibold text-white hover:bg-[#084477] disabled:opacity-50">Add company</button>}</header>
    {viewer && !canAdd && <p className="text-sm text-slate-600">You can browse all team watchlists. An active investment-team assignment is needed to add or manage entries.</p>}
    <section aria-label="Watchlist filters" className="flex flex-wrap gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <label className="min-w-48 flex-1 text-sm font-semibold">Team<select value={team} onChange={event => { setTeam(event.target.value); setPage(1); }} className="mt-1 block w-full rounded-lg border border-slate-300 p-2 font-normal"><option value="my" disabled={Boolean(viewer && !viewer.teamId)}>My Team</option><option value="all">All Teams</option>{teams.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="min-w-40 flex-1 text-sm font-semibold">Status<select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className="mt-1 block w-full rounded-lg border border-slate-300 p-2 font-normal"><option value="active">Active entries</option><option value="all">All statuses</option>{WATCHLIST_STATUSES.map(item => <option key={item} value={item}>{watchlistStatusLabel(item)}</option>)}</select></label>
      <label className="min-w-48 flex-1 text-sm font-semibold">Company, ticker or sector<input value={searchInput} maxLength={80} onChange={event => setSearchInput(event.target.value)} placeholder="Search company, ticker or sector" className="mt-1 block w-full rounded-lg border border-slate-300 p-2 font-normal" /></label>
      <div className="flex items-end gap-3"><button type="button" disabled={loading} onClick={() => setReload(value => value + 1)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50">Refresh list</button><button type="button" disabled={quotesLoading || !records.length} onClick={() => setPriceReload(value => value + 1)} className="px-2 py-2 text-sm font-semibold text-[#0E5791] disabled:opacity-50">Refresh prices</button></div>
    </section>
    {editor && <section ref={form} id="watchlist-editor" className="scroll-mt-24 rounded-2xl border border-blue-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-bold">{editor.entry ? `Edit ${editor.symbol}` : "Add a company to watch"}</h2><form onSubmit={save} className="mt-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-3"><label className="text-sm font-semibold">Investment team<select required disabled={busy || Boolean(editor.entry) || !viewer?.isAdmin} value={editor.teamId} onChange={event => setEditor({ ...editor, teamId: event.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 p-2 font-normal disabled:bg-slate-100">{teams.filter(item => viewer?.isAdmin || item.id === viewer?.teamId).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="text-sm font-semibold">Ticker<input required disabled={busy || Boolean(editor.entry)} maxLength={40} value={editor.symbol} onChange={event => setEditor({ ...editor, symbol: event.target.value.toUpperCase() })} placeholder="AAPL or RY.TO" className="mt-1 block w-full rounded-lg border border-slate-300 p-2 font-normal disabled:bg-slate-100" /></label>
        <label className="text-sm font-semibold">Target price · CAD (optional)<input disabled={busy} type="number" step="0.000001" min="0.000001" max="1000000000000" value={editor.target} onChange={event => setEditor({ ...editor, target: event.target.value })} placeholder="Leave blank if undecided" className="mt-1 block w-full rounded-lg border border-slate-300 p-2 font-normal" /></label></div>
      <label className="block text-sm font-semibold">Why are we watching this company?<textarea required disabled={busy} rows={4} maxLength={5000} value={editor.notes} onChange={event => setEditor({ ...editor, notes: event.target.value })} placeholder="Investment thesis, questions to research, or catalysts to watch…" className="mt-1 block w-full rounded-lg border border-slate-300 p-3 font-normal" /></label>
      <label className="block max-w-md text-sm font-semibold">Sector (optional)<input disabled={busy} maxLength={120} value={editor.sector} onChange={event => setEditor({ ...editor, sector: event.target.value })} placeholder="Defaults to the quote sector or investment team" className="mt-1 block w-full rounded-lg border border-slate-300 p-2 font-normal" /></label>
      <label className="block max-w-xs text-sm font-semibold">Research status<select disabled={busy} value={editor.status} onChange={event => setEditor({ ...editor, status: event.target.value as WatchlistStatus })} className="mt-1 block w-full rounded-lg border border-slate-300 p-2 font-normal">{WATCHLIST_STATUSES.map(item => <option key={item} value={item}>{watchlistStatusLabel(item)}</option>)}</select></label>
      {!editor.entry && <p className="text-xs text-slate-500">Company details are verified from the ticker when you save. Canadian listings usually need an exchange suffix such as .TO.</p>}
      <div className="flex gap-3"><button disabled={busy} className="rounded-xl bg-[#0E5791] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save entry"}</button><button type="button" disabled={busy} onClick={closeEditor} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">Cancel</button></div>
      {formError && <div><p role="alert" className="text-sm text-rose-700">{formError}</p>{editor.entry && <p className="mt-1 text-xs text-slate-600">If the entry changed, refresh the list and reopen it after saving a copy of your notes.</p>}</div>}
    </form></section>}
    {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    {actionError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{actionError}</p>}
    {listError && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p>{listError}</p>{signInRequired && <Link href="/login?next=%2Fwatchlist" className="mt-2 inline-block font-semibold underline">Sign in</Link>}</div>}
    {quoteError && <p role="status" className="text-sm text-amber-800">{quoteError}</p>}
    <p className="text-xs text-slate-500">Prices are estimates and may be delayed. Quote lookups are cached for up to one minute. Target prices and research notes are shared with the fund.</p>
    {loading ? <p role="status" className="py-8 text-center text-slate-600">Loading watchlist…</p> : !listError && records.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="font-semibold">No entries match these filters</h2><p className="mt-2 text-sm text-slate-500">Choose another team or status{canAdd ? ", or add your first company." : "."}</p></div> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{records.map(entry => <WatchlistCard key={entry.id} entry={entry} teamName={teams.find(item => item.id === entry.teamId)?.name || "Investment team"} quote={quotes[entry.symbol]?.quote} quoteLoading={quotesLoading} canManage={Boolean(viewer && canManageWatchlist(viewer, entry.teamId))} busy={busy} onEdit={() => openEditor(entry)} onArchive={() => void archive(entry)} />)}</div>}
    {!listError && <nav aria-label="Watchlist pages" className="flex items-center justify-between gap-3"><button type="button" disabled={page === 1 || loading} onClick={() => setPage(value => value - 1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button><span className="text-sm text-slate-500">Page {page}</span><button type="button" disabled={!hasMore || loading} onClick={() => setPage(value => value + 1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button></nav>}
  </div></main>;
}
