import TradeSubmissions from "@/components/trades/TradeSubmissions";

export default async function TradeSubmissionsPage({ searchParams }: { searchParams: Promise<{ proposal?: string | string[] }> }) {
  const params = await searchParams;
  return <TradeSubmissions initialProposalId={typeof params.proposal === "string" ? params.proposal : undefined} />;
}
