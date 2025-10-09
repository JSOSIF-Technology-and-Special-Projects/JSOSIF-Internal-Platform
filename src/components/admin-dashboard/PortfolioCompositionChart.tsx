"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={validatedData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={100}
            paddingAngle={2}
            dataKey="percentage"
          >
            {validatedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
