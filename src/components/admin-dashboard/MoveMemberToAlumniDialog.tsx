"use client";

import { useEffect, useId, useRef, useState } from "react";

export interface GraduatingMember {
  id: string;
  name: string;
  program: string;
  memberSince: string;
}

function suggestedYears(memberSince: string) {
  const joined = new Date(`${memberSince.slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(joined.getTime())) return 0;
  const today = new Date(`${new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(new Date())}T00:00:00Z`);
  const anniversaryPassed = today.getUTCMonth() > joined.getUTCMonth() ||
    (today.getUTCMonth() === joined.getUTCMonth() && today.getUTCDate() >= joined.getUTCDate());
  return Math.max(0, today.getUTCFullYear() - joined.getUTCFullYear() - (anniversaryPassed ? 0 : 1));
}

export default function MoveMemberToAlumniDialog({ member, onClose, onMoved }: {
  member: GraduatingMember;
  onClose: () => void;
  onMoved: (member: GraduatingMember) => Promise<void>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fieldId = useId();

  useEffect(() => { dialog.current?.showModal(); }, []);

  async function move(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const data = new FormData(event.currentTarget);
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/members/${encodeURIComponent(member.id)}/alumni`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          degree: String(data.get("degree") ?? ""),
          yearsOnFund: Number(data.get("yearsOnFund")),
          companyName: String(data.get("companyName") ?? ""),
          industry: String(data.get("industry") ?? ""),
        }),
      });
      const result = await response.json();
      if (!response.ok || result.error) throw new Error(result.error || result.message || "Unable to move this member.");
      await onMoved(member);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to move this member. Please try again.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <dialog ref={dialog} onClose={onClose} onCancel={(event) => { if (busy) event.preventDefault(); }} aria-labelledby={`${fieldId}-heading`} aria-describedby={`${fieldId}-description`} className="m-auto max-h-[85vh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl border bg-white p-6 shadow-xl backdrop:bg-slate-900/40">
      <h2 id={`${fieldId}-heading`} className="text-xl font-bold text-slate-900">Move {member.name} to alumni</h2>
      <p id={`${fieldId}-description`} className="mt-2 text-sm text-slate-600">They will appear in Alumni and leave the active member and team lists. Their member history will be kept.</p>
      <form onSubmit={move} className="mt-5 space-y-4">
        <div>
          <label htmlFor={`${fieldId}-degree`} className="mb-1 block text-sm font-medium">Degree</label>
          <input id={`${fieldId}-degree`} name="degree" defaultValue={member.program} required maxLength={255} disabled={busy} className="w-full rounded-xl border border-slate-300 p-2 text-sm" />
        </div>
        <div>
          <label htmlFor={`${fieldId}-years`} className="mb-1 block text-sm font-medium">Years on fund</label>
          <input id={`${fieldId}-years`} name="yearsOnFund" type="number" defaultValue={suggestedYears(member.memberSince)} min={0} max={2147483647} step={1} required disabled={busy} aria-describedby={`${fieldId}-years-note`} className="w-full rounded-xl border border-slate-300 p-2 text-sm" />
          <p id={`${fieldId}-years-note`} className="mt-1 text-xs text-slate-500">Suggested from their joining date. Adjust this if needed.</p>
        </div>
        <div>
          <label htmlFor={`${fieldId}-company`} className="mb-1 block text-sm font-medium">Company (optional)</label>
          <input id={`${fieldId}-company`} name="companyName" maxLength={255} disabled={busy} className="w-full rounded-xl border border-slate-300 p-2 text-sm" />
        </div>
        <div>
          <label htmlFor={`${fieldId}-industry`} className="mb-1 block text-sm font-medium">Industry (optional)</label>
          <input id={`${fieldId}-industry`} name="industry" maxLength={255} disabled={busy} className="w-full rounded-xl border border-slate-300 p-2 text-sm" />
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" disabled={busy} onClick={() => dialog.current?.close()} className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={busy} className="rounded-xl bg-[#0E5791] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? "Moving…" : "Move to alumni"}</button>
        </div>
      </form>
    </dialog>
  );
}
