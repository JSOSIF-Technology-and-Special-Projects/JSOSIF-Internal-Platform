import Watchlist from "@/components/watchlist/Watchlist";

export default async function WatchlistPage({ searchParams }: { searchParams: Promise<{ team?: string | string[] }> }) {
  const params = await searchParams;
  return <Watchlist initialTeam={typeof params.team === "string" ? params.team : undefined} />;
}
