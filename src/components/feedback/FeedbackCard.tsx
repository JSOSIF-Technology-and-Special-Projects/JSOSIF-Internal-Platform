"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FEEDBACK_STATUSES, feedbackDate, feedbackKindLabel, feedbackPagePath, feedbackStatusLabel, type FeedbackStatus, type FeedbackSubmission } from "@/lib/feedback/types";

const statusColors = { new: "bg-blue-50 text-blue-800", in_progress: "bg-amber-50 text-amber-900", resolved: "bg-emerald-50 text-emerald-800" };
export default function FeedbackCard({ entry, canReview = false, busy = false, saving = false, onStatusChange }: {
  entry: FeedbackSubmission; canReview?: boolean; busy?: boolean; saving?: boolean;
  onStatusChange?: (entry: FeedbackSubmission, status: FeedbackStatus) => void;
}) {
  const [status, setStatus] = useState(entry.status);
  useEffect(() => { setStatus(entry.status); }, [entry.status, entry.updatedAt]);
  const page = feedbackPagePath(entry.pagePath);
  return <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-slate-900">{feedbackKindLabel(entry.kind)}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[entry.status]}`}>{feedbackStatusLabel(entry.status)}</span></div>
    <div className="text-sm text-slate-700"><p className="whitespace-pre-wrap break-words">{entry.message.length > 300 ? `${entry.message.slice(0, 300)}…` : entry.message}</p>{entry.message.length > 300 && <details className="mt-2"><summary className="cursor-pointer font-semibold text-[#0E5791]">Read full feedback</summary><p className="mt-2 whitespace-pre-wrap break-words">{entry.message}</p></details>}</div>
    {page && <p className="text-xs text-slate-500">Related page: <Link href={page} className="break-all font-semibold text-[#0E5791] underline">{page}</Link></p>}
    <div className="mt-auto border-t border-slate-100 pt-3 text-xs text-slate-500"><p>Submitted by {entry.authorName}</p><p className="mt-1">{feedbackDate(entry.createdAt)} ET</p>{entry.reviewedAt && <p className="mt-2">Status updated{entry.reviewedByName ? ` by ${entry.reviewedByName}` : ""} · {feedbackDate(entry.reviewedAt)} ET</p>}</div>
    {canReview && onStatusChange && <form onSubmit={event => { event.preventDefault(); onStatusChange(entry, status); }} className="flex flex-wrap items-end gap-3">
      <label className="flex-1 text-xs font-semibold text-slate-600">Review status<select disabled={busy} value={status} onChange={event => setStatus(event.target.value as FeedbackStatus)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm font-normal">{FEEDBACK_STATUSES.map(item => <option key={item} value={item}>{feedbackStatusLabel(item)}</option>)}</select></label>
      <button type="submit" disabled={busy || status === entry.status} className="rounded-lg bg-[#0E5791] px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">{saving ? "Saving…" : "Update status"}</button>
    </form>}
  </article>;
}
