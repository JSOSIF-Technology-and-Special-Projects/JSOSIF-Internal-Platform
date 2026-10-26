"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PROPOSAL_STATUSES, isProposalId, proposalDate, statusLabel, type ProposalStatus, type ProposalViewer, type TradeProposal } from "@/lib/trades/proposals";
import ProposalSnapshot from "./ProposalSnapshot";

const statusClass = (status: ProposalStatus) => ({ draft: "bg-slate-100 text-slate-700", pending: "bg-amber-50 text-amber-800", approved: "bg-emerald-50 text-emerald-800", rejected: "bg-rose-50 text-rose-800" })[status];

export default function TradeSubmissions({ initialProposalId }: { initialProposalId?: string }) {
  const [viewer, setViewer] = useState<ProposalViewer | null>(null);
  const [records, setRecords] = useState<TradeProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [reload, setReload] = useState(0);
  const [selectedId, setSelectedId] = useState(initialProposalId || "");
  const [selected, setSelected] = useState<TradeProposal | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailReload, setDetailReload] = useState(0);
  const [reason, setReason] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [notificationWarning, setNotificationWarning] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);

  useEffect(() => { setSelectedId(initialProposalId || ""); }, [initialProposalId]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setListError("");
    fetch(`/api/trade-proposals?${new URLSearchParams({ status: filter, page: String(page) })}`, { signal: controller.signal, cache: "no-store" })
      .then(async response => { const result = await response.json(); if (!response.ok) throw new Error(result.error || "Unable to load proposals."); return result; })
      .then(result => { if (!controller.signal.aborted) { setRecords(result.data); setViewer(result.viewer); setHasMore(result.hasMore); } })
      .catch(error => { if (!controller.signal.aborted) setListError(error instanceof Error ? error.message : "Unable to load proposals."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filter, page, reload]);

  useEffect(() => {
    const controller = new AbortController();
    setSelected(null);
    setActionError("");
    setNotice("");
    setNotificationWarning("");
    setDetailError("");
    setDetailLoading(false);
    if (!selectedId) return () => controller.abort();
    if (!isProposalId(selectedId)) { setDetailError("Invalid proposal ID."); return () => controller.abort(); }
    setDetailLoading(true);
    fetch(`/api/trade-proposals/${encodeURIComponent(selectedId)}`, { signal: controller.signal, cache: "no-store" })
      .then(async response => { const result = await response.json(); if (!response.ok) throw new Error(result.error || "Unable to load this proposal."); return result; })
      .then(result => { if (!controller.signal.aborted) { setSelected(result.data); setViewer(result.viewer); setReason(result.data.reason); setReviewNote(""); } })
      .catch(error => { if (!controller.signal.aborted) setDetailError(error instanceof Error ? error.message : "Unable to load this proposal."); })
      .finally(() => { if (!controller.signal.aborted) setDetailLoading(false); });
    return () => controller.abort();
  }, [selectedId, detailReload]);

  useEffect(() => { if (selectedId) document.getElementById("proposal-builder")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [selectedId]);

  async function act(action: "save" | "submit" | "approve" | "reject" | "retry_notification") {
    if (!selected || pending.current) return;
    pending.current = true;
    setBusy(true);
    setActionError("");
    setNotice("");
    setNotificationWarning("");
    try {
      const response = await fetch(`/api/trade-proposals/${encodeURIComponent(selected.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, reason, reviewNote, expectedUpdatedAt: selected.updatedAt }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update this proposal.");
      setSelected(result.data);
      setReason(result.data.reason);
      setNotificationWarning(result.warning || "");
      setNotice(result.notice || (action === "retry_notification" ? (result.warning ? "The proposal remains submitted." : "Notification email sent.") : action === "save" ? "Draft saved." : action === "submit" ? "Proposal submitted for review." : action === "approve" ? "Proposal approved. No trades have been executed." : "Proposal rejected. The submitter can see your review note."));
      setReload(value => value + 1);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to update this proposal.");
    } finally { pending.current = false; setBusy(false); }
  }

  return <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div><h1 className="text-3xl font-black text-slate-900">Trade Submissions</h1><p className="mt-2 text-sm text-slate-500">{viewer?.canReview ? "Review submitted proposals and track your decisions." : "Track your trade proposals from draft through review."}</p><p className="mt-1 text-xs text-slate-500">Submitting or approving a proposal does not execute trades or change portfolio holdings.</p></div>
        <Link href="/simulator" className="rounded-xl bg-[#0E5791] px-4 py-3 text-sm font-bold text-white">New proposal in simulator</Link>
      </section>
      {viewer && !viewer.approvalConfigured && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Approval requires exactly one active member with a CEO description and a linked login account. You can save drafts while that assignment is updated.</p>}
      {viewer?.approverName && <p className="text-sm text-slate-600">CEO approver: <strong>{viewer.approverName}</strong></p>}
      {viewer?.notificationTestEmail && <p className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-[#0E5791]">Testing: notification emails go to {viewer.notificationTestEmail}. Only the CEO account can approve or reject proposals.</p>}
      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><label htmlFor="proposal-filter" className="mb-1 block text-xs font-bold text-slate-600">Status</label><select id="proposal-filter" value={filter} onChange={event => { setFilter(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="all">All proposals</option>{PROPOSAL_STATUSES.map(status => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></div>
          <button type="button" disabled={loading || busy} onClick={() => setReload(value => value + 1)} className="text-sm font-semibold text-[#0E5791] disabled:opacity-50">Refresh list</button>
        </div>
        {listError ? <p role="alert" className="text-sm text-red-600">{listError}</p> : loading ? <p role="status" className="text-sm text-slate-500">Loading proposals…</p> : records.length === 0 ? <p className="text-sm text-slate-500">No proposals with this status. Start in the simulator to create one.</p> : <div className="space-y-3">{records.map(proposal => <button type="button" key={proposal.id} disabled={busy} onClick={() => setSelectedId(proposal.id)} aria-pressed={selectedId === proposal.id} className={`w-full rounded-2xl border p-4 text-left disabled:opacity-50 ${selectedId === proposal.id ? "border-blue-300 bg-blue-50/50" : "border-slate-200 hover:bg-slate-50"}`}>
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-bold">{proposal.legs.slice(0, 2).map(leg => `${leg.side.toUpperCase()} ${leg.shares} ${leg.symbol}`).join(" · ")}{proposal.legs.length > 2 && ` · +${proposal.legs.length - 2} more`}</span><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(proposal.status)}`}>{statusLabel(proposal.status)}</span></div>
          <p className="mt-2 text-xs text-slate-500">{proposal.authorName} · {proposalDate(proposal.submittedAt || proposal.createdAt)} ET</p>
        </button>)}</div>}
        {!loading && !listError && (page > 1 || hasMore) && <nav aria-label="Proposal pages" className="mt-4 flex items-center justify-between gap-3 text-sm"><button type="button" disabled={page === 1 || busy} onClick={() => setPage(value => value - 1)} className="font-semibold text-[#0E5791] disabled:opacity-40">Newer</button><span className="text-slate-500">Page {page}</span><button type="button" disabled={!hasMore || busy} onClick={() => setPage(value => value + 1)} className="font-semibold text-[#0E5791] disabled:opacity-40">Older</button></nav>}
      </section>
      {(selectedId || detailLoading) && <section id="proposal-builder" className="scroll-mt-24 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        {detailLoading ? <p role="status">Loading proposal…</p> : detailError ? <div><p role="alert" className="text-sm text-red-600">{detailError}</p><button type="button" onClick={() => setDetailReload(value => value + 1)} className="mt-2 text-sm font-semibold text-[#0E5791]">Reload proposal</button></div> : selected && <>
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Proposal details</h2><p className="mt-1 text-xs text-slate-500">By {selected.authorName} · Created {proposalDate(selected.createdAt)} ET</p></div><div className="flex flex-wrap items-center gap-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(selected.status)}`}>{statusLabel(selected.status)}</span><button type="button" disabled={busy} onClick={() => { if (selected.status === "draft" && reason !== selected.reason && !window.confirm("Reloading will discard unsaved reasoning. Continue?")) return; if (reviewNote.trim() && !window.confirm("Reloading will discard your unsaved review note. Continue?")) return; setDetailReload(value => value + 1); }} className="text-xs font-semibold text-[#0E5791] disabled:opacity-50">Refresh proposal</button></div></div>
          <ProposalSnapshot proposal={selected} />
          {selected.status === "draft" && selected.authorId === viewer?.id ? <form onSubmit={event => { event.preventDefault(); void act("submit"); }} className="space-y-3 border-t border-slate-200 pt-5">
            <label htmlFor="proposal-reason" className="block text-sm font-bold">Investment reasoning and key risks</label>
            <textarea id="proposal-reason" value={reason} onChange={event => setReason(event.target.value)} rows={6} maxLength={5000} required disabled={busy} placeholder="Explain the investment thesis, supporting evidence, and risks for the CEO to review." className="w-full rounded-xl border border-slate-300 p-3 text-sm" />
            <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => void act("save")} className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-50">Save draft</button><button type="submit" disabled={busy || !viewer?.approvalConfigured} className="rounded-xl bg-[#0E5791] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? "Saving…" : "Submit for review"}</button></div>
          </form> : <div className="border-t border-slate-200 pt-5"><h3 className="text-sm font-bold">Investment reasoning and key risks</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-600">{selected.reason || "No reasoning added yet."}</p></div>}
          {selected.status === "pending" && viewer?.canReview && <form onSubmit={event => { event.preventDefault(); void act("approve"); }} className="space-y-3 rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
            <h3 className="text-sm font-bold">CEO review</h3><label htmlFor="proposal-review" className="block text-sm">Review note (required when rejecting)</label><textarea id="proposal-review" value={reviewNote} onChange={event => setReviewNote(event.target.value)} rows={4} maxLength={5000} disabled={busy} className="w-full rounded-xl border border-slate-300 p-3 text-sm" />
            <div className="flex flex-wrap gap-3"><button type="submit" disabled={busy} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Approve proposal</button><button type="button" disabled={busy || !reviewNote.trim()} onClick={() => void act("reject")} className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-bold text-rose-700 disabled:opacity-50">Reject proposal</button></div>
          </form>}
          {selected.status === "pending" && !viewer?.canReview && <p className="text-sm text-slate-500">Waiting for {viewer?.approverName || "the Chief Executive Officer"} to review this proposal.</p>}
          {selected.status === "pending" && <div className="rounded-xl border border-slate-200 p-4 text-sm">
            <h3 className="font-bold">Submission notification</h3>
            <p className="mt-1 text-slate-600">{selected.notificationStatus === "sent" ? `Email sent${selected.notifiedAt ? ` ${proposalDate(selected.notifiedAt)} ET` : ""}.` : selected.notificationStatus === "sending" ? "Email delivery is in progress. Refresh the proposal to check its status." : selected.notificationStatus === "failed" ? "The email could not be sent. Your proposal is still submitted and awaiting review." : "No notification email has been sent yet."}</p>
            {(selected.authorId === viewer?.id || viewer?.canReview) && selected.notificationStatus !== "sent" && (selected.notificationStatus !== "sending" || !selected.notificationAttemptedAt || Date.now() - Date.parse(selected.notificationAttemptedAt) >= 300000) && <button type="button" disabled={busy} onClick={() => void act("retry_notification")} className="mt-2 font-semibold text-[#0E5791] disabled:opacity-50">{selected.notificationStatus === "not_sent" ? "Send notification email" : "Retry email"}</button>}
          </div>}
          {selected.reviewedAt && <div className="rounded-xl bg-slate-50 p-4"><h3 className="text-sm font-bold">{statusLabel(selected.status)} by {selected.reviewerName}</h3><p className="mt-1 text-xs text-slate-500">{proposalDate(selected.reviewedAt)} ET</p>{selected.reviewNote && <p className="mt-3 whitespace-pre-wrap break-words text-sm text-slate-600">{selected.reviewNote}</p>}</div>}
          {notice && <p role="status" className="text-sm text-emerald-700">{notice}</p>}
          {notificationWarning && <p role="alert" className="text-sm text-amber-800">{notificationWarning}</p>}
          {actionError && <div><p role="alert" className="text-sm text-red-600">{actionError}</p><button type="button" disabled={busy} onClick={() => setDetailReload(value => value + 1)} className="mt-2 text-sm font-semibold text-[#0E5791]">Reload proposal</button></div>}
        </>}
      </section>}
    </div>
  </main>;
}
