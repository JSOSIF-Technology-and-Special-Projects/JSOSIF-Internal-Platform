"use client";

import React, { useState, useMemo } from "react";
import { PortfolioHolding } from "@/data/fallbackHoldings";

interface FundHoldingsTableProps {
  holdings: PortfolioHolding[];
}

type SortField =
  | "symbol"
  | "name"
  | "team"
  | "shares"
  | "averageCost"
  | "currentPrice"
  | "marketValue"
  | "totalReturn"
  | "changePercent";

type SortDirection = "asc" | "desc";

export default function FundHoldingsTable({ holdings }: FundHoldingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedAssetType, setSelectedAssetType] = useState<"all" | "Equity" | "Bond">("all");
  const [selectedPerformance, setSelectedPerformance] = useState<"all" | "gainers" | "decliners">("all");
  const [sortField, setSortField] = useState<SortField>("marketValue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Extract unique teams and sectors for filters
  const teams = useMemo(() => {
    return Array.from(new Set(holdings.map((h) => h.team).filter(Boolean))).sort();
  }, [holdings]);

  const sectors = useMemo(() => {
    return Array.from(new Set(holdings.map((h) => h.sector || h.industry).filter(Boolean))).sort();
  }, [holdings]);

  // Currency Formatter
  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(val)) return "$0.00";
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Handle sort header click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filtered and Sorted holdings
  const filteredHoldings = useMemo(() => {
    return holdings
      .filter((h) => {
        const symbol = (h.symbol || h.ticker || "").toLowerCase();
        const name = (h.name || "").toLowerCase();
        const industry = (h.industry || "").toLowerCase();
        const query = searchTerm.toLowerCase().trim();

        const matchesSearch =
          !query ||
          symbol.includes(query) ||
          name.includes(query) ||
          industry.includes(query);

        const matchesTeam = selectedTeam === "all" || h.team === selectedTeam;
        const matchesSector =
          selectedSector === "all" ||
          h.sector === selectedSector ||
          h.industry === selectedSector;

        const isBond =
          h.assetType === "Bond" ||
          h.name?.includes("%") ||
          h.ticker?.startsWith("US") ||
          h.ticker?.startsWith("CA") ||
          h.ticker?.startsWith("BAC4");

        const matchesType =
          selectedAssetType === "all" ||
          (selectedAssetType === "Bond" && isBond) ||
          (selectedAssetType === "Equity" && !isBond);

        const bookValue = h.shares * (h.averageCost || h.costCad || 0);
        const marketValue = h.marketValue || h.shares * (h.currentPrice || h.averageCost || 0);
        const totalReturn = marketValue - bookValue;

        const matchesPerf =
          selectedPerformance === "all" ||
          (selectedPerformance === "gainers" && totalReturn >= 0) ||
          (selectedPerformance === "decliners" && totalReturn < 0);

        return matchesSearch && matchesTeam && matchesSector && matchesType && matchesPerf;
      })
      .sort((a, b) => {
        const aBook = a.shares * (a.averageCost || a.costCad || 0);
        const bBook = b.shares * (b.averageCost || b.costCad || 0);
        const aMkt = a.marketValue || a.shares * (a.currentPrice || 0);
        const bMkt = b.marketValue || b.shares * (b.currentPrice || 0);
        const aReturn = aMkt - aBook;
        const bReturn = bMkt - bBook;

        let aVal: any = a[sortField as keyof PortfolioHolding];
        let bVal: any = b[sortField as keyof PortfolioHolding];

        if (sortField === "totalReturn") {
          aVal = aReturn;
          bVal = bReturn;
        } else if (sortField === "marketValue") {
          aVal = aMkt;
          bVal = bMkt;
        }

        if (typeof aVal === "string") {
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      });
  }, [
    holdings,
    searchTerm,
    selectedTeam,
    selectedSector,
    selectedAssetType,
    selectedPerformance,
    sortField,
    sortDirection,
  ]);

  const visibleTotalValue = filteredHoldings.reduce((sum, h) => sum + h.marketValue, 0);

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <span className="text-gray-300 ml-1 inline-block transition-opacity opacity-0 group-hover:opacity-100">
          ↕
        </span>
      );
    }
    return (
      <span className="text-[#0E5791] ml-1 font-bold">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      {/* Table Top Toolbar */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Fund Holdings Directory</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Comprehensive directory of equities and fixed-income corporate debt securities
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-semibold text-gray-900">{filteredHoldings.length}</span> of{" "}
            <span>{holdings.length} positions</span>
            <span className="text-gray-300">•</span>
            <span>
              Subtotal: <strong className="text-gray-900">{formatCurrency(visibleTotalValue)}</strong>
            </span>
          </div>
        </div>

        {/* Filter controls row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
          {/* Search box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search ticker, bond, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5791]/20 focus:border-[#0E5791] transition-all"
            />
          </div>

          {/* Asset Type filter */}
          <div>
            <select
              value={selectedAssetType}
              onChange={(e) => setSelectedAssetType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5791]/20 focus:border-[#0E5791] transition-all"
            >
              <option value="all">All Asset Types</option>
              <option value="Equity">Equities Only</option>
              <option value="Bond">Bonds / Fixed Income Only</option>
            </select>
          </div>

          {/* Division dropdown */}
          <div>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5791]/20 focus:border-[#0E5791] transition-all"
            >
              <option value="all">All Divisions ({teams.length})</option>
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Sector dropdown */}
          <div>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5791]/20 focus:border-[#0E5791] transition-all"
            >
              <option value="all">All Sectors ({sectors.length})</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Performance filter */}
          <div>
            <select
              value={selectedPerformance}
              onChange={(e) => setSelectedPerformance(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5791]/20 focus:border-[#0E5791] transition-all"
            >
              <option value="all">All Return Profiles</option>
              <option value="gainers">Positive Return Only</option>
              <option value="decliners">Negative Return Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-left">
          <thead className="bg-gray-50/80 text-[11px] font-semibold text-gray-500 uppercase tracking-wider select-none">
            <tr>
              <th
                onClick={() => handleSort("symbol")}
                className="px-6 py-3.5 cursor-pointer hover:text-gray-900 group"
              >
                <span>Asset / Identifier</span>
                <SortIndicator field="symbol" />
              </th>
              <th
                onClick={() => handleSort("team")}
                className="px-6 py-3.5 cursor-pointer hover:text-gray-900 group"
              >
                <span>Division</span>
                <SortIndicator field="team" />
              </th>
              <th
                onClick={() => handleSort("shares")}
                className="px-6 py-3.5 text-right cursor-pointer hover:text-gray-900 group"
              >
                <span>Shares / Units</span>
                <SortIndicator field="shares" />
              </th>
              <th
                onClick={() => handleSort("currentPrice")}
                className="px-6 py-3.5 text-right cursor-pointer hover:text-gray-900 group"
              >
                <span>Cost vs Market</span>
                <SortIndicator field="currentPrice" />
              </th>
              <th
                onClick={() => handleSort("totalReturn")}
                className="px-6 py-3.5 text-right cursor-pointer hover:text-gray-900 group"
              >
                <span>Unrealized Return</span>
                <SortIndicator field="totalReturn" />
              </th>
              <th
                onClick={() => handleSort("changePercent")}
                className="px-6 py-3.5 text-right cursor-pointer hover:text-gray-900 group"
              >
                <span>Movement</span>
                <SortIndicator field="changePercent" />
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white text-xs">
            {filteredHoldings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-900">No matching holdings found</p>
                    <p className="text-gray-500 text-xs mt-1 max-w-sm">
                      Try adjusting your search criteria or resetting your filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedTeam("all");
                        setSelectedSector("all");
                        setSelectedAssetType("all");
                        setSelectedPerformance("all");
                      }}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredHoldings.map((holding) => {
                const isBond =
                  holding.assetType === "Bond" ||
                  holding.name?.includes("%") ||
                  holding.ticker?.startsWith("US") ||
                  holding.ticker?.startsWith("CA") ||
                  holding.ticker?.startsWith("BAC4");

                const bookValue = holding.shares * (holding.averageCost || holding.costCad || 0);
                const marketVal =
                  holding.marketValue || holding.shares * (holding.currentPrice || holding.averageCost || 0);
                const totalReturn = marketVal - bookValue;
                const totalReturnPct = bookValue > 0 ? (totalReturn / bookValue) * 100 : 0;
                const isProfitable = totalReturn >= 0;
                const isDayPositive = (holding.change ?? 0) >= 0;

                return (
                  <tr
                    key={holding.id || holding.ticker}
                    className="hover:bg-blue-50/40 transition-colors duration-150"
                  >
                    {/* Asset / Ticker / Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${
                            isBond
                              ? "bg-purple-50 border-purple-200 text-purple-700"
                              : "bg-gray-100 border-gray-200 text-gray-800"
                          }`}
                        >
                          {isBond ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          ) : (
                            holding.symbol || holding.ticker
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            <span>{holding.symbol || holding.ticker}</span>
                            {isBond ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                                Corporate Bond
                              </span>
                            ) : (
                              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                {holding.industry || holding.sector || "Equity"}
                              </span>
                            )}
                          </div>
                          <div className="text-gray-500 text-[11px] truncate max-w-[220px]">
                            {holding.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Division */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-700">
                        {holding.team || "Fund"}
                      </span>
                    </td>

                    {/* Shares & Book Value */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="font-semibold text-gray-900">
                        {holding.shares.toLocaleString()} <span className="text-gray-400 font-normal">units</span>
                      </div>
                      <div className="text-gray-500 text-[11px]">
                        Cost: {formatCurrency(holding.averageCost || holding.costCad)}
                      </div>
                      <div className="text-gray-400 text-[10px]">
                        Book: {formatCurrency(bookValue)}
                      </div>
                    </td>

                    {/* Price & Market Value */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="font-bold text-gray-900">
                        {formatCurrency(marketVal)}
                      </div>
                      <div className="text-gray-500 text-[11px]">
                        {isBond
                          ? `Par: ${formatCurrency(holding.averageCost || holding.costCad)}`
                          : `@ ${formatCurrency(holding.currentPrice || holding.averageCost)} CAD`}
                      </div>
                    </td>

                    {/* Unrealized Return */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {isBond ? (
                        <div className="text-gray-500 text-[11px] font-medium">
                          Par Value Holding
                        </div>
                      ) : (
                        <>
                          <div
                            className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold ${
                              isProfitable
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {isProfitable ? "+" : ""}
                            {formatCurrency(totalReturn)}
                          </div>
                          <div
                            className={`text-[11px] font-medium mt-0.5 ${
                              isProfitable ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {isProfitable ? "+" : ""}
                            {totalReturnPct.toFixed(2)}%
                          </div>
                        </>
                      )}
                    </td>

                    {/* 24h Movement */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {isBond ? (
                        <span className="text-gray-400 text-[11px]">Accrued Yield</span>
                      ) : (
                        <>
                          <div
                            className={`font-semibold ${
                              isDayPositive ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {isDayPositive ? "+" : ""}
                            {formatCurrency(holding.change)}
                          </div>
                          <div
                            className={`text-[11px] ${
                              isDayPositive ? "text-emerald-500" : "text-rose-500"
                            }`}
                          >
                            {isDayPositive ? "+" : ""}
                            {(holding.changePercent ?? 0).toFixed(2)}%
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
