"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CompositionData {
  symbol: string;
  name: string;
  percentage: number;
  color: string;
}

interface PortfolioCompositionChartProps {
  data?: CompositionData[];
}

const defaultData = [
  { symbol: "MGOL", name: "MGO Global Inc.", percentage: 35, color: "#FF6B6B" },
  { symbol: "LTRY", name: "Lottery.com Inc.", percentage: 25, color: "#4ECDC4" },
  { symbol: "NVDA", name: "NVIDIA Corporation", percentage: 30, color: "#45B7D1" },
  { symbol: "F", name: "Ford Motor Company", percentage: 10, color: "#96CEB4" }
];

export default function PortfolioCompositionChart({ data = defaultData }: PortfolioCompositionChartProps) {
  // Validate and sanitize data
  const chartData = data && Array.isArray(data) && data.length > 0 ? data : defaultData;
  
  // Ensure all required fields exist
  const validatedData = chartData.map((item, index) => ({       //idk if this part is necessary
    symbol: item?.symbol || `UNKNOWN${index}`,
    name: item?.name || `Unknown Company ${index}`,
    percentage: typeof item?.percentage === 'number' ? item.percentage : 0,
    color: item?.color || `hsl(${index * 90}, 70%, 50%)`
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{data.symbol}</p>
          <p className="text-sm text-gray-600">{data.name}</p>
          <p className="text-sm">{data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full flex flex-col gap-4">
      <div className="flex-1 min-h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={validatedData}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={120}
              paddingAngle={2}
              dataKey="percentage"
            >
              {validatedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {validatedData.map((item) => (
          <div
            key={`${item.symbol}-${item.name}`}
            className="flex items-start gap-2 min-w-0"
            title={item.name}
          >
            <span
              className="mt-1 h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-700 leading-5 break-words">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
