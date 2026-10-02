import { correlationMatrix, correlationWindow } from "@/lib/portfolio/correlation";
import { getPriceHistory } from "@/lib/portfolio/getPriceHistory";

import StockCorrelationComparison from "./StockCorrelationComparison";

interface Holding {
  symbol: string;
  name: string;
}

export default async function TeamCorrelationMatrix({ holdings, teamId }: { holdings: Holding[]; teamId: string }) {
  const uniqueHoldings = [...new Map(holdings.filter((holding) => holding.symbol?.trim()).map((holding) => [holding.symbol.trim().toUpperCase(), { ...holding, symbol: holding.symbol.trim().toUpperCase() }])).values()];
  const { startDate, endDate } = correlationWindow();
  const results = await Promise.allSettled(uniqueHoldings.map((holding) => getPriceHistory(holding.symbol, startDate, endDate)));
  const series = results.map((result) => result.status === "fulfilled" ? result.value : []);
  const matrix = correlationMatrix(series);
  return <StockCorrelationComparison teamId={teamId} holdings={uniqueHoldings} matrix={matrix} startDate={startDate} endDate={endDate} />;
}
