"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import createAnnouncement from "@/lib/mutations/announcements/createAnnouncement";

export default function AnnouncementControls({ canPost }: { canPost: boolean }) {
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  const [posting, setPosting] = useState(false);
  const pending = useRef(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") startTransition(() => router.refresh());
    };
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [router]);

  async function post(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    pending.current = true;
    setPosting(true);
    setError("");
    setSuccess("");
    try {
      const result = await createAnnouncement({ title: String(data.get("title") ?? ""), information: String(data.get("information") ?? ""), isPinned: data.get("isPinned") === "on" });
      if ("error" in result) {
        setError(result.error);
      } else {
        form.reset();
        setSuccess("Announcement posted. Everyone can now see it on the homepage.");
        startTransition(() => router.refresh());
      }
    } catch {
      setError("Unable to post the announcement. Please try again.");
    } finally {
      pending.current = false;
      setPosting(false);
    }
  }

  return (
    <div className="mb-5">
      {canPost && (
        <form onSubmit={post} className="mb-5 space-y-3 rounded-2xl border border-slate-200 p-4">
          <h3 className="font-bold text-sm text-slate-900">Post an announcement</h3>
          <div>
            <label htmlFor="announcement-title" className="block text-sm font-medium mb-1">Title</label>
            <input id="announcement-title" name="title" required maxLength={255} disabled={posting} className="w-full rounded-xl border border-slate-300 p-2 text-sm" />
          </div>
          <div>
            <label htmlFor="announcement-message" className="block text-sm font-medium mb-1">Message</label>
            <textarea id="announcement-message" name="information" required maxLength={10000} rows={4} disabled={posting} className="w-full rounded-xl border border-slate-300 p-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="isPinned" disabled={posting} className="accent-[#0E5791]" />
            Pin to the top of the feed
          </label>
          <button type="submit" disabled={posting} className="rounded-xl bg-[#0E5791] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{posting ? "Posting…" : "Post announcement"}</button>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {success && <p role="status" className="text-sm text-emerald-700">{success}</p>}
        </form>
      )}
      <button type="button" disabled={refreshing} onClick={() => startTransition(() => router.refresh())} className="text-sm font-semibold text-[#0E5791] disabled:opacity-50">{refreshing ? "Refreshing…" : "Refresh announcements"}</button>
    </div>
  );
}
