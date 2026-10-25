"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { FEEDBACK_KINDS, FEEDBACK_STATUSES, feedbackFields, feedbackId, feedbackKindLabel, feedbackStatusLabel, type FeedbackKind, type FeedbackStatus, type FeedbackSubmission, type FeedbackViewer } from "@/lib/feedback/types";
import FeedbackCard from "./FeedbackCard";

export default function FeedbackBoard({ adminView = false, initialPagePath = null }: { adminView?: boolean; initialPagePath?: string | null }) {
  const [viewer, setViewer] = useState<FeedbackViewer | null>(null);
  const [records, setRecords] = useState<FeedbackSubmission[]>([]);
  const [statusFilter, setStatusFilter] = useState(adminView ? "new" : "all");
  const [kindFilter, setKindFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);
  const [signInRequired, setSignInRequired] = useState(false);
  const [kind, setKind] = useState<FeedbackKind>("bug");
  const [message, setMessage] = useState("");
  const [pagePath, setPagePath] = useState(initialPagePath || "");
  const [submitError, setSubmitError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const pending = useRef(false);
  const requestId = useRef<{ key: string; id: string } | null>(null);
  const busy = submitting || updatingId !== null;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setListError(""); setSignInRequired(false);
    fetch(`/api/feedback?${new URLSearchParams({ scope: adminView ? "all" : "mine", status: statusFilter, kind: kindFilter, page: String(page) })}`, { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        const result = await response.json().catch(() => ({ error: "Unable to load feedback. Please refresh." }));
        if (controller.signal.aborted) return;
        if (result.viewer) setViewer(result.viewer);
        if (response.status === 401) { setViewer(null); setSignInRequired(true); }
        setSetupRequired(Boolean(result.setupRequired));
        if (!response.ok || !Array.isArray(result.data)) throw new Error(result.error || "Unable to load feedback.");
        setRecords(result.data); setHasMore(result.hasMore);
      })
      .catch(error => { if (!controller.signal.aborted) { setRecords([]); setHasMore(false); setListError(error instanceof Error ? error.message : "Unable to load feedback."); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [adminView, statusFilter, kindFilter, page, reload]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    setSubmitError(""); setNotice("");
    const fields = feedbackFields({ kind, message, pagePath });
    if ("error" in fields) { setSubmitError(fields.error); return; }
    const key = JSON.stringify(fields.data);
    if (requestId.current?.key !== key) requestId.current = { key, id: crypto.randomUUID() };
    pending.current = true; setSubmitting(true);
    try {
      const response = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields.data, id: requestId.current.id }) });
      const result = await response.json().catch(() => ({ error: "Unable to confirm the submission. Please try again." }));
      if (!response.ok || !feedbackId(result.data?.id)) throw new Error(result.error || "Unable to submit feedback.");
      setMessage(""); setPagePath(fields.data.pagePath || ""); requestId.current = null;
      setStatusFilter("all"); setKindFilter("all"); setPage(1); setReload(value => value + 1);
      setNotice("Feedback submitted. You can track its status below.");
    } catch (error) { setSubmitError(error instanceof Error ? error.message : "Unable to submit feedback."); }
    finally { pending.current = false; setSubmitting(false); }
  }
  async function updateStatus(entry: FeedbackSubmission, status: FeedbackStatus) {
    if (pending.current) return;
    pending.current = true; setUpdatingId(entry.id); setStatusError(""); setNotice("");
    try {
      const response = await fetch(`/api/feedback/${entry.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, expectedUpdatedAt: entry.updatedAt }) });
      const result = await response.json().catch(() => ({ error: "Unable to confirm the status update. Refresh the queue." }));
      if (!response.ok || !feedbackId(result.data?.id)) throw new Error(result.error || "Unable to update feedback.");
      setNotice(`Feedback marked ${feedbackStatusLabel(status)}.`); setReload(value => value + 1);
    } catch (error) { setStatusError(error instanceof Error ? error.message : "Unable to update feedback."); }
    finally { pending.current = false; setUpdatingId(null); }
  }

  return <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8"><div className="mx-auto max-w-5xl space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#0E5791]">{adminView ? "Private admin queue" : "Help improve the platform"}</p><h1 className="mt-1 text-3xl font-bold">{adminView ? "Feedback review" : "Feedback"}</h1><p className="mt-2 text-sm text-slate-600">{adminView ? "Review member reports and update their progress." : "Report a bug, suggest a feature, or share general feedback."}</p></div>{adminView ? <Link href="/feedback" className="text-sm font-semibold text-[#0E5791] underline">My submissions</Link> : viewer?.isAdmin && <Link href="/admin-dashboard/feedback" className="text-sm font-semibold text-[#0E5791] underline">Open admin review queue</Link>}</header>
    {!adminView && <section aria-labelledby="feedback-form-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 id="feedback-form-title" className="text-lg font-bold">Send feedback</h2><p className="mt-1 text-sm text-slate-500">Visible to you and platform admins.{viewer ? ` Submitted as ${viewer.name}.` : ""}</p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <label className="block max-w-sm text-sm font-semibold">Feedback type<select value={kind} disabled={submitting} onChange={event => setKind(event.target.value as FeedbackKind)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 font-normal">{FEEDBACK_KINDS.map(item => <option key={item} value={item}>{feedbackKindLabel(item)}</option>)}</select></label>
        <label className="block text-sm font-semibold">Description<textarea required rows={5} maxLength={5000} value={message} disabled={submitting} onChange={event => setMessage(event.target.value)} placeholder={kind === "bug" ? "What happened, what did you expect, and how can we reproduce it?" : kind === "feature_request" ? "What would you like to add or change, and how would it help?" : "Share your feedback…"} className="mt-1 block w-full rounded-lg border border-slate-300 p-3 font-normal" /></label>
        <label className="block text-sm font-semibold">Related page (optional)<input value={pagePath} maxLength={2048} disabled={submitting} onChange={event => setPagePath(event.target.value)} placeholder="/simulator" className="mt-1 block w-full rounded-lg border border-slate-300 p-2 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">Captured from where you opened feedback. You can change or remove it; only the page path is saved.</span></label>
        <button type="submit" disabled={submitting || !viewer || setupRequired} className="rounded-xl bg-[#0E5791] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#084477] disabled:opacity-40">{submitting ? "Submitting…" : "Submit feedback"}</button>
        {submitError && <p role="alert" className="text-sm text-rose-700">{submitError}</p>}
      </form>
    </section>}
    {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    {statusError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><p>{statusError}</p><button type="button" onClick={() => setReload(value => value + 1)} className="mt-2 font-semibold underline">Refresh queue</button></div>}
    <section aria-labelledby="feedback-list-title" className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="feedback-list-title" className="text-xl font-bold">{adminView ? "Member submissions" : "My submissions"}</h2><button type="button" disabled={loading || busy} onClick={() => setReload(value => value + 1)} className="text-sm font-semibold text-[#0E5791] disabled:opacity-40">Refresh</button></div>
      <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4"><label className="min-w-40 flex-1 text-sm font-semibold">Status<select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(1); }} className="mt-1 block w-full rounded-lg border border-slate-300 p-2 font-normal"><option value="all">All statuses</option>{FEEDBACK_STATUSES.map(item => <option key={item} value={item}>{feedbackStatusLabel(item)}</option>)}</select></label><label className="min-w-40 flex-1 text-sm font-semibold">Type<select value={kindFilter} onChange={event => { setKindFilter(event.target.value); setPage(1); }} className="mt-1 block w-full rounded-lg border border-slate-300 p-2 font-normal"><option value="all">All types</option>{FEEDBACK_KINDS.map(item => <option key={item} value={item}>{feedbackKindLabel(item)}</option>)}</select></label></div>
      {listError && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p>{listError}</p>{signInRequired && <Link href={`/login?next=${encodeURIComponent(adminView ? "/admin-dashboard/feedback" : "/feedback")}`} className="mt-2 inline-block font-semibold underline">Sign in</Link>}</div>}
      {loading ? <p role="status" className="py-6 text-center text-slate-500">Loading feedback…</p> : !listError && !records.length ? <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No feedback matches these filters.</p> : <div className="grid gap-4 md:grid-cols-2">{records.map(entry => <FeedbackCard key={entry.id} entry={entry} canReview={adminView && Boolean(viewer?.isAdmin)} busy={busy} saving={updatingId === entry.id} onStatusChange={(item, status) => void updateStatus(item, status)} />)}</div>}
      {!listError && <nav aria-label="Feedback pages" className="flex items-center justify-between gap-3 text-sm"><button type="button" disabled={page === 1 || loading || busy} onClick={() => setPage(value => value - 1)} className="rounded-lg border border-slate-300 px-3 py-2 font-semibold disabled:opacity-40">Previous</button><span className="text-slate-500">Page {page}</span><button type="button" disabled={!hasMore || loading || busy} onClick={() => setPage(value => value + 1)} className="rounded-lg border border-slate-300 px-3 py-2 font-semibold disabled:opacity-40">Next</button></nav>}
    </section>
  </div></main>;
}
