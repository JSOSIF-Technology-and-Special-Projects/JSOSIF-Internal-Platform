import React from 'react';

export interface Holding {
  symbol: string;
  name: string;
  shares: number;        // How many shares the fund owns (amount_in_shares)
  averageCost: number;   // The price paid per share (costCad)
  currentPrice: number;  // The live market price
  change: number;        // Daily price change ($)
  changePercent: number; // Daily price change (%)
}

interface HoldingsTableProps {
  holdings?: Holding[];
}

// Updated mock data to include shares and average cost
const defaultHoldings: Holding[] = [
  { symbol: "ACN", name: "Accenture", shares: 26, averageCost: 425.85, currentPrice: 440.20, change: 5.10, changePercent: 1.17 },
  { symbol: "COST", name: "Costco Wholesale", shares: 9, averageCost: 444.15, currentPrice: 720.50, change: -2.30, changePercent: -0.32 },
  { symbol: "CSCO", name: "Cisco Systems", shares: 85, averageCost: 54.54, currentPrice: 48.90, change: -0.45, changePercent: -0.91 },
  { symbol: "PEP", name: "PepsiCo", shares: 34, averageCost: 153.88, currentPrice: 165.30, change: 1.25, changePercent: 0.76 }
];

export default function HoldingsTable({ holdings = defaultHoldings }: HoldingsTableProps) {
  // Helper to format currency nicely
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(value);
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow ring-1 ring-black ring-opacity-5">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Asset</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Position</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Avg Cost / Book</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Current Price / Market</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Total Return</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Daily Change</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {holdings.map((holding, index) => {
            // Calculate dynamic portfolio metrics
            const bookValue = holding.shares * holding.averageCost;
            const marketValue = holding.shares * holding.currentPrice;
            const totalReturn = marketValue - bookValue;
            const totalReturnPercent = (totalReturn / bookValue) * 100;

            return (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                {/* Asset: Symbol and Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{holding.symbol}</div>
                    <div className="text-sm text-gray-500">{holding.name}</div>
                  </div>
                </td>

                {/* Position: Shares owned */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">{holding.shares} shrs</div>
                </td>

                {/* Book: Average Cost and Total Book Value */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-900">{formatCurrency(holding.averageCost)}</div>
                  <div className="text-xs text-gray-500">Book: {formatCurrency(bookValue)}</div>
                </td>

                {/* Market: Current Price and Total Market Value */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(holding.currentPrice)}</div>
                  <div className="text-xs text-gray-500">Mkt: {formatCurrency(marketValue)}</div>
                </td>

                {/* Total Return: All-time profit/loss based on Average Cost */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className={`text-sm font-semibold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn)}
                  </div>
                  <div className={`text-xs ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalReturn >= 0 ? '+' : ''}{totalReturnPercent.toFixed(2)}%
                  </div>
                </td>

                {/* Daily Change: Today's market movement */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {holding.change != null &&
                    <div className={`text-sm ${holding.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {holding.change >= 0 ? '+' : ''}{formatCurrency(holding.change)}
                    </div>
                  }
                  {holding.changePercent != null &&
                    <div className={`text-xs ${holding.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%
                    </div>
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}