"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import updateAnnouncement from "@/lib/mutations/announcements/updateAnnouncement";
import type { UpdateAnnouncementInput } from "@/lib/mutations/announcements/updateAnnouncement";
import deleteAnnouncement from "@/lib/mutations/announcements/deleteAnnouncement";

interface Props {
  id: string;
  title: string;
  information: string;
  authorName: string | null;
  publishedAt: string;
  publishedLabel: string;
  editedAt: string | null;
  editedLabel: string | null;
  isPinned: boolean;
  canManage: boolean;
}

export default function AnnouncementCard({ id, title, information, authorName, publishedAt, publishedLabel, editedAt, editedLabel, isPinned, canManage }: Props) {
  const router = useRouter();
  const fieldId = useId();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [deleted, setDeleted] = useState(false);

  async function mutate(input?: UpdateAnnouncementInput) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const result = input
        ? await updateAnnouncement({ announcementId: id, input })
        : await deleteAnnouncement({ announcementId: id });
      if ("error" in result) {
        setError(result.error || "Unable to save your change. Please try again.");
      } else {
        if (input) {
          setEditing(false);
          setStatus(input.title !== undefined || input.information !== undefined ? "Announcement updated." : input.isPinned ? "Announcement pinned." : "Announcement unpinned.");
        } else {
          setDeleted(true);
        }
        router.refresh();
      }
    } catch {
      setError("Unable to save your change. Please try again.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  if (deleted) return null;

  return (
    <article className={`min-w-0 rounded-2xl border p-5 ${isPinned ? "border-blue-200 bg-blue-50/50" : "border-slate-200 bg-slate-50/50"}`}>
      {isPinned && <span className="mb-3 inline-flex rounded-md bg-blue-100 px-2 py-1 text-xs font-bold text-[#0E5791]">Pinned</span>}
      {editing ? (
        <form onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void mutate({ title: String(data.get("title") ?? ""), information: String(data.get("information") ?? "") });
        }} className="space-y-3">
          <div>
            <label htmlFor={`${fieldId}-title`} className="block text-sm font-medium mb-1">Title</label>
            <input id={`${fieldId}-title`} name="title" defaultValue={title} required maxLength={255} disabled={busy} className="w-full rounded-xl border border-slate-300 p-2 text-sm" />
          </div>
          <div>
            <label htmlFor={`${fieldId}-message`} className="block text-sm font-medium mb-1">Message</label>
            <textarea id={`${fieldId}-message`} name="information" defaultValue={information} required maxLength={10000} rows={4} disabled={busy} className="w-full rounded-xl border border-slate-300 p-2 text-sm" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={busy} className="rounded-xl bg-[#0E5791] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save changes"}</button>
            <button type="button" disabled={busy} onClick={() => { setEditing(false); setError(""); }} className="text-sm font-semibold text-slate-600 disabled:opacity-50">Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <h3 className="font-bold text-sm text-slate-900 break-words">{title}</h3>
          <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap break-words">{information}</p>
        </>
      )}
      <p className="mt-3 text-xs text-slate-500">{authorName ? `Posted by ${authorName}` : "Posted before author tracking"} · <time dateTime={publishedAt}>{publishedLabel} ET</time></p>
      {editedAt && editedLabel && <p className="mt-1 text-xs text-slate-500">Edited <time dateTime={editedAt}>{editedLabel} ET</time></p>}
      {canManage && !editing && (
        <div className="mt-3">
          {confirmingDelete ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-700">Delete this announcement?</p>
              <div className="flex gap-4">
                <button type="button" disabled={busy} onClick={() => void mutate()} className="text-sm font-semibold text-red-700 disabled:opacity-50">{busy ? "Deleting…" : "Delete announcement"}</button>
                <button type="button" disabled={busy} onClick={() => { setConfirmingDelete(false); setError(""); }} className="text-sm font-semibold text-slate-600 disabled:opacity-50">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              <button type="button" disabled={busy} onClick={() => { setEditing(true); setError(""); setStatus(""); }} className="text-sm font-semibold text-[#0E5791] disabled:opacity-50">Edit</button>
              <button type="button" disabled={busy} onClick={() => void mutate({ isPinned: !isPinned })} className="text-sm font-semibold text-[#0E5791] disabled:opacity-50">{busy ? "Saving…" : isPinned ? "Unpin" : "Pin"}</button>
              <button type="button" disabled={busy} onClick={() => { setConfirmingDelete(true); setError(""); setStatus(""); }} className="text-sm font-semibold text-red-700 disabled:opacity-50">Delete</button>
            </div>
          )}
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      {status && <p role="status" className="mt-3 text-sm text-emerald-700">{status}</p>}
    </article>
  );
}
