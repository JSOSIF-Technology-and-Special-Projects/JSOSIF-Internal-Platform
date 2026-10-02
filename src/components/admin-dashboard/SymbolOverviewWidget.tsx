"use client";
import dynamic from "next/dynamic";

// TradingView generates random element IDs, so it must not render during SSR.
const SymbolOverview = dynamic(
  () => import("react-ts-tradingview-widgets").then((widgets) => widgets.SymbolOverview),
  {
    ssr: false,
    loading: () => <p role="status" className="text-sm text-slate-500 p-4">Loading price chart…</p>,
  }
);

interface BondTicker {
	s: string; // Symbol
}

interface SymbolOverviewWidgetProps {
	ticker?: string; // Comma-separated tickers
	bondData?: BondTicker[]; // Array of bond tickers
}

export default function SymbolOverviewWidget({
	ticker,
	bondData = [],
}: SymbolOverviewWidgetProps) {
	// Parse the ticker string into [label, symbol] pairs for TradingView
	const formattedTickers = ticker
		? ticker.split(",").map((t) => {
				const trimmed = t.trim();
				const label = trimmed.includes("|") ? trimmed.split("|")[0] : trimmed;
				return [label, trimmed];
		  })
		: [];

	// Format bond tickers into TradingView symbols
	const formattedBondTickers = bondData.map((bond) => [bond.s, bond.s]);

	// Combine both tickers
	const allTickers = [...formattedTickers, ...formattedBondTickers];

	return (
		<div className="h-[350px] lg:h-[500px] md:w-[80%] mx-2 md:mx-auto flex flex-col items-center">
			{/* TradingView SymbolOverview Widget */}
			{allTickers.length > 0 && (
				<div className="w-full h-full">
					<SymbolOverview
						symbols={allTickers}
						colorTheme="light"
						autosize
						chartType="area"
						downColor="#800080"
						borderDownColor="#800080"
						wickDownColor="#800080"
						fontColor="#000"
						showFloatingTooltip={false}
						dateFormat="MM/dd/yyyy"
						valuesTracking="0"
						scalePosition="right"
						hideMarketStatus={true}
						widgetFontColor="#000"
					/>
				</div>
			)}
		</div>
	);
}
