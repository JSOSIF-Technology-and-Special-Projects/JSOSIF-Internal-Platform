interface Holding {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface HoldingsTableProps {
  holdings?: Holding[];
}

const defaultHoldings = [
  { symbol: "MGOL", name: "MGO Global Inc.", price: 0.1693, change: 0.0303, changePercent: 3.15, volume: 315155155 },
  { symbol: "LTRY", name: "Lottery.com Inc.", price: 1.4699, change: 0.98, changePercent: 22.64, volume: 463757 },
  { symbol: "NVDA", name: "NVIDIA Corporation", price: 127.4499, change: 2.6199, changePercent: 26.19, volume: 188811275 },
  { symbol: "F", name: "Ford Motor Company", price: 9.35, change: -0.66, changePercent: -6.6, volume: 167836690 }
];

export default function HoldingsTable({ holdings = defaultHoldings }: HoldingsTableProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {holdings.map((holding, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">▲ {holding.symbol}</div>
                  <div className="text-sm text-gray-500">{holding.name}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${holding.price.toFixed(4)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className={`text-sm ${holding.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {holding.change >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-500">
                  {formatNumber(holding.volume)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
