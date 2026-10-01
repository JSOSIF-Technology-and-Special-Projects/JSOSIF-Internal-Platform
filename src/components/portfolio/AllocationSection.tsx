"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PortfolioHolding } from "@/data/fallbackHoldings";

interface AllocationSectionProps {
  holdings: PortfolioHolding[];
  totalMarketValue: number;
}

const PALETTE = [
  "#0E5791", // Fund Blue
  "#2A8CD6", // Light Blue
  "#00C49F", // Mint Teal
  "#FFBB28", // Amber
  "#FF8042", // Tangerine
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F59E0B", // Golden
  "#6366F1", // Indigo
];

export default function AllocationSection({
  holdings,
  totalMarketValue,
}: AllocationSectionProps) {
  const [activeTab, setActiveTab] = useState<"team" | "sector">("team");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Helper formatters
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Group by team or sector
  const groupingKey = activeTab === "team" ? "team" : "sector";

  const groupedMap = holdings.reduce<Record<string, { value: number; count: number }>>(
    (acc, h) => {
      let key = h[groupingKey] || "Other";
      if (h.ticker === "CASH" || h.assetType === "Cash" || key === "Executives") {
        key = "Cash";
      }
      if (!acc[key]) {
        acc[key] = { value: 0, count: 0 };
      }
      acc[key].value += h.marketValue;
      acc[key].count += 1;
      return acc;
    },
    {}
  );

  const chartData = Object.entries(groupedMap)
    .map(([name, data], index) => {
      const percentage =
        totalMarketValue > 0 ? (data.value / totalMarketValue) * 100 : 0;
      return {
        name,
        value: Math.round(data.value),
        count: data.count,
        percentage,
        color: name === "Cash" ? "#64748B" : PALETTE[index % PALETTE.length],
      };
    })
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-2xl border border-gray-700 text-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-semibold text-sm">{item.name}</span>
          </div>
          <div className="space-y-1 text-gray-300">
            <div className="flex justify-between gap-4">
              <span>Market Value:</span>
              <span className="font-bold text-white">
                {formatCurrency(item.value)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Portfolio Weight:</span>
              <span className="font-bold text-white">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Holdings:</span>
              <span className="font-bold text-white">{item.count} assets</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Portfolio Allocation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Asset distribution and capital concentration across divisions
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/60 text-xs font-semibold text-slate-600">
          <button
            onClick={() => {
              setActiveTab("team");
              setActiveIndex(null);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "team"
                ? "bg-white text-[#0E5791] shadow-xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            By Investment Division
          </button>
          <button
            onClick={() => {
              setActiveTab("sector");
              setActiveIndex(null);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "sector"
                ? "bg-white text-[#0E5791] shadow-xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            By Sector / Industry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Donut Chart with Center Text */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={108}
                  paddingAngle={3}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#ffffff"
                      strokeWidth={activeIndex === index ? 3 : 1}
                      className="transition-all duration-200 cursor-pointer"
                      style={{
                        filter:
                          activeIndex === index
                            ? "drop-shadow(0 4px 10px rgba(0,0,0,0.15))"
                            : "none",
                        transform:
                          activeIndex === index ? "scale(1.03)" : "scale(1)",
                        transformOrigin: "center center",
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Centered Total / Active Item display */}
          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
            {activeIndex !== null && chartData[activeIndex] ? (
              <>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 max-w-[110px] truncate">
                  {chartData[activeIndex].name}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {chartData[activeIndex].percentage.toFixed(1)}%
                </span>
                <span className="text-[11px] text-gray-500">
                  {formatCurrency(chartData[activeIndex].value)}
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Total AUM
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(totalMarketValue)}
                </span>
                <span className="text-[11px] text-gray-500">
                  {chartData.length} {activeTab === "team" ? "Teams" : "Sectors"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Detailed Breakdown List with Progress Bars */}
        <div className="lg:col-span-7 space-y-3.5 max-h-80 overflow-y-auto pr-1">
          {chartData.map((item, index) => {
            const isHovered = activeIndex === index;
            return (
              <div
                key={item.name}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  isHovered ? "bg-gray-50 ring-1 ring-gray-200" : "hover:bg-gray-50/70"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-gray-800 truncate">
                      {item.name}
                    </span>
                    <span className="text-gray-400 text-[11px] shrink-0">
                      ({item.count} {item.count === 1 ? "holding" : "holdings"})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-medium text-gray-600">
                      {formatCurrency(item.value)}
                    </span>
                    <span className="font-bold text-gray-900 w-12 text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Micro Progress Bar */}
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
