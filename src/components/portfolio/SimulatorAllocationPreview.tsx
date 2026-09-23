"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface AllocationItemComparison {
  name: string;
  beforeValue: number;
  beforePercent: number;
  afterValue: number;
  afterPercent: number;
  deltaPercent: number;
  deltaValue: number;
  color: string;
}

interface SimulatorAllocationPreviewProps {
  teamComparisons: AllocationItemComparison[];
  sectorComparisons: AllocationItemComparison[];
  assetComparisons: AllocationItemComparison[];
  totalMarketValueBefore: number;
  totalMarketValueAfter: number;
  cashBefore: number;
  cashAfter: number;
}

export default function SimulatorAllocationPreview({
  teamComparisons,
  sectorComparisons,
  assetComparisons,
  totalMarketValueBefore,
  totalMarketValueAfter,
  cashBefore,
  cashAfter,
}: SimulatorAllocationPreviewProps) {
  const [activeTab, setActiveTab] = useState<"team" | "sector" | "asset">("team");
  const [chartMode, setChartMode] = useState<"after" | "before">("after");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const activeComparisons =
    activeTab === "team"
      ? teamComparisons
      : activeTab === "sector"
      ? sectorComparisons
      : assetComparisons;

  // Pie chart data based on selected mode (after vs before)
  const pieData = activeComparisons.map((item) => ({
    name: item.name,
    value: chartMode === "after" ? Math.max(0, item.afterValue) : Math.max(0, item.beforeValue),
    percentage: chartMode === "after" ? item.afterPercent : item.beforePercent,
    color: item.color,
    deltaPercent: item.deltaPercent,
  }));

  const activeTotalValue = chartMode === "after" ? totalMarketValueAfter : totalMarketValueBefore;

  // Concentration risk alerts
  const highConcentrationItems = activeComparisons.filter(
    (item) => item.afterPercent > (activeTab === "sector" ? 30 : 15)
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const match = activeComparisons.find((c) => c.name === data.name);
      return (
        <div className="bg-gray-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-gray-700 text-xs min-w-[210px]">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-800">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-bold text-sm text-white truncate">{data.name}</span>
          </div>

          <div className="space-y-1.5 text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-400">Current Weight:</span>
              <span className="font-semibold">{match?.beforePercent.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Simulated Weight:</span>
              <span className="font-bold text-white">{match?.afterPercent.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray-800">
              <span className="text-gray-400">Net Allocation Shift:</span>
              <span
                className={`font-bold ${
                  (match?.deltaPercent ?? 0) > 0.05
                    ? "text-emerald-400"
                    : (match?.deltaPercent ?? 0) < -0.05
                    ? "text-rose-400"
                    : "text-gray-400"
                }`}
              >
                {(match?.deltaPercent ?? 0) > 0 ? "+" : ""}
                {(match?.deltaPercent ?? 0).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Simulated Capital:</span>
              <span className="font-bold text-white">{formatCurrency(data.value)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl bg-white border border-gray-100 p-6 md:p-8 shadow-sm">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#0E5791]" />
            <h3 className="text-lg font-bold text-gray-900">
              What-If Allocation Preview
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            Real-time projection of portfolio capital weights before and after simulated execution
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Tab Buttons */}
          <div className="inline-flex p-1 rounded-2xl bg-gray-100 text-xs font-semibold text-gray-600">
            <button
              onClick={() => setActiveTab("team")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === "team"
                  ? "bg-white text-[#0E5791] shadow-sm font-bold"
                  : "hover:text-gray-900"
              }`}
            >
              Divisions
            </button>
            <button
              onClick={() => setActiveTab("sector")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === "sector"
                  ? "bg-white text-[#0E5791] shadow-sm font-bold"
                  : "hover:text-gray-900"
              }`}
            >
              Sectors
            </button>
            <button
              onClick={() => setActiveTab("asset")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === "asset"
                  ? "bg-white text-[#0E5791] shadow-sm font-bold"
                  : "hover:text-gray-900"
              }`}
            >
              Asset Classes & Cash
            </button>
          </div>

          {/* Toggle Before vs After Chart */}
          <div className="inline-flex p-1 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs font-semibold text-gray-600">
            <button
              onClick={() => setChartMode("before")}
              className={`px-2.5 py-1.5 rounded-xl transition-all ${
                chartMode === "before"
                  ? "bg-[#0E5791] text-white shadow-sm font-bold"
                  : "text-[#0E5791] hover:bg-blue-100/50"
              }`}
            >
              Baseline
            </button>
            <button
              onClick={() => setChartMode("after")}
              className={`px-2.5 py-1.5 rounded-xl transition-all ${
                chartMode === "after"
                  ? "bg-gradient-to-r from-[#0E5791] to-[#2A8CD6] text-white shadow-sm font-bold"
                  : "text-[#0E5791] hover:bg-blue-100/50"
              }`}
            >
              Simulated Post-Trade
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Visual Donut Chart */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={108}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, idx) => (
                    <Cell
                      key={`preview-cell-${idx}`}
                      fill={entry.color}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      className="transition-all duration-300"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Center Info in Donut */}
          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {chartMode === "after" ? "Simulated Total" : "Baseline Total"}
            </span>
            <span className="text-xl font-extrabold text-gray-900">
              {formatCurrency(activeTotalValue)}
            </span>
            <span className="text-[11px] font-semibold text-[#0E5791] mt-0.5">
              {chartMode === "after" ? "What-If Projection" : "Current Fund AUM"}
            </span>
          </div>
        </div>

        {/* Comparative List with Delta Indicators & Progress Bars */}
        <div className="lg:col-span-7 space-y-3 max-h-96 overflow-y-auto pr-2">
          {activeComparisons.map((item) => {
            const hasShift = Math.abs(item.deltaPercent) >= 0.05;
            const isGain = item.deltaPercent > 0;

            return (
              <div
                key={item.name}
                className="p-3.5 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all space-y-2"
              >
                {/* Top Row: Label, Before % -> After %, Delta Pill */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-bold text-gray-800 truncate text-sm">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 font-medium text-gray-500">
                      <span>{item.beforePercent.toFixed(1)}%</span>
                      <svg
                        className="w-3 h-3 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      <span className="font-bold text-gray-900 text-sm">
                        {item.afterPercent.toFixed(1)}%
                      </span>
                    </div>

                    {/* Delta Badge */}
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-0.5 ${
                        !hasShift
                          ? "bg-gray-50 text-gray-500 border-gray-200"
                          : isGain
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {hasShift && (
                        <span>{isGain ? "▲" : "▼"}</span>
                      )}
                      <span>
                        {isGain ? "+" : ""}
                        {item.deltaPercent.toFixed(2)}%
                      </span>
                    </span>
                  </div>
                </div>

                {/* Comparative Double Bar */}
                <div className="space-y-1">
                  {/* Before bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-12 shrink-0">Baseline</span>
                    <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full opacity-40 transition-all duration-500"
                        style={{
                          width: `${Math.min(100, item.beforePercent)}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 w-16 text-right shrink-0">
                      {formatCurrency(item.beforeValue)}
                    </span>
                  </div>

                  {/* After bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-600 w-12 shrink-0">Simulated</span>
                    <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, item.afterPercent)}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-800 w-16 text-right shrink-0">
                      {formatCurrency(item.afterValue)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Concentration Risk Banner if relevant */}
      {highConcentrationItems.length > 0 && (
        <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <svg
            className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <span className="font-bold">Portfolio Concentration Advisory: </span>
            <span>
              The simulated trade places{" "}
              {highConcentrationItems.map((h) => `${h.name} (${h.afterPercent.toFixed(1)}%)`).join(", ")}{" "}
              above recommended concentration guidelines. Review with the Portfolio Manager and Investment Committee prior to execution.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
