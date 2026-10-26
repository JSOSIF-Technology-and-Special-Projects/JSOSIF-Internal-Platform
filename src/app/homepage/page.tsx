import Homepage from '@/pages/HomePage';
import Announcements from '@/components/announcements/Announcements';

export default async function Page({ searchParams }: { searchParams: Promise<{ announcementPage?: string | string[] }> }) {
  const params = await searchParams;
  const requestedPage = typeof params.announcementPage === "string" ? Number(params.announcementPage) : 1;
  const announcementPage = Number.isInteger(requestedPage) && requestedPage >= 1 && requestedPage <= 10000 ? requestedPage : 1;
  return <Homepage><Announcements page={announcementPage} /></Homepage>;
}
