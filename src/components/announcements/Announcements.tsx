import { listAnnouncements } from "@/lib/queries/announcements/listAnnouncements";
import { isAdmin } from "@/utils/permissions";
import AnnouncementControls from "./AnnouncementControls";
import AnnouncementCard from "./AnnouncementCard";
import { getAnnouncementUser } from "@/lib/queries/announcements/getAnnouncementUser";
import Link from "next/link";

export default async function Announcements({ page = 1 }: { page?: number }) {
  const [result, canPost, user] = await Promise.all([listAnnouncements(page), isAdmin(), getAnnouncementUser()]);

  return (
    <section aria-labelledby="announcements-heading" className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
      <h2 id="announcements-heading" className="text-xl sm:text-2xl font-black text-slate-900">Platform Updates & Notices</h2>
      <p className="text-xs text-slate-500 mt-1 mb-6">Fund announcements, operational changes, and system notes</p>
      <AnnouncementControls canPost={canPost} />
      {result.error ? (
        <p role="alert" className="text-sm text-red-600">Unable to load announcements. Use Refresh to try again.</p>
      ) : result.data?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.data.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              id={announcement.id}
              title={announcement.title}
              information={announcement.information}
              authorName={announcement.author_name}
              publishedAt={announcement.publishedAt}
              publishedLabel={new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Toronto" }).format(new Date(announcement.publishedAt))}
              editedAt={announcement.edited_at ?? null}
              editedLabel={announcement.edited_at ? new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Toronto" }).format(new Date(announcement.edited_at)) : null}
              isPinned={announcement.is_pinned === true}
              canManage={Boolean(user && announcement.author_id === user.id)}
            />
          ))}
        </div>
      ) : <p className="text-sm text-slate-500">{page > 1 ? "No older announcements on this page." : "No announcements yet."}</p>}
      {!("error" in result) && (result.hasMore || result.page > 1) && (
        <nav aria-label="Announcements pagination" className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm">
          <p className="text-xs text-slate-500">Page {result.page} · Up to 10 notices per page, plus pinned announcements.</p>
          <div className="flex gap-4">
            {result.page > 1 && <Link href={`/homepage?announcementPage=${result.page - 1}#announcements-heading`} className="font-semibold text-[#0E5791]">Newer announcements</Link>}
            {result.hasMore && <Link href={`/homepage?announcementPage=${result.page + 1}#announcements-heading`} className="font-semibold text-[#0E5791]">View older announcements</Link>}
          </div>
        </nav>
      )}
    </section>
  );
}
