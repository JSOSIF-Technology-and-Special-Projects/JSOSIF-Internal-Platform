"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PortfolioHolding } from "@/data/fallbackHoldings";
import SimulatorAllocationPreview, {
  AllocationItemComparison,
} from "./SimulatorAllocationPreview";

interface TradeSimulatorProps {
  holdings: PortfolioHolding[];
  totalMarketValue: number;
  initialTeam?: string;
}

interface SellLeg {
  id: string;
  holdingId: string;
  ticker: string;
  name: string;
  team: string;
  sector: string;
  ownedShares: number;
  currentPrice: number;
  sharesToSell: number;
}

const PALETTE = [
  "#0E5791", // Fund Navy
  "#2A8CD6", // Sky Blue
  "#00C49F", // Emerald Teal
  "#FFBB28", // Amber
  "#FF8042", // Tangerine
  "#8B5CF6", // Violet
  "#EC4899", // Magenta
  "#14B8A6", // Cyan
  "#F59E0B", // Gold
  "#6366F1", // Indigo
  "#64748B", // Slate
];

const DEFAULT_CASH_BALANCE = 25000;

export default function TradeSimulator({
  holdings,
  totalMarketValue,
  initialTeam,
}: TradeSimulatorProps) {
  // 1. Team perspective filter
  const [selectedTeam, setSelectedTeam] = useState<string>(initialTeam || "all");

  // 2. Fund Cash Reserve (Loaded/Saved from localStorage with sensible default)
  const [cashBalance, setCashBalance] = useState<number>(DEFAULT_CASH_BALANCE);
  const [isEditingCash, setIsEditingCash] = useState<boolean>(false);
  const [cashInput, setCashInput] = useState<string>(DEFAULT_CASH_BALANCE.toString());

  // 3. Purchase (Buy Leg) State
  const [buySourceMode, setBuySourceMode] = useState<"existing" | "new">("existing");
  const [selectedExistingHoldingId, setSelectedExistingHoldingId] = useState<string>("");
  const [newTickerInput, setNewTickerInput] = useState<string>("");
  const [isFetchingQuote, setIsFetchingQuote] = useState<boolean>(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Active Target Asset Details
  const [targetTicker, setTargetTicker] = useState<string>("");
  const [targetName, setTargetName] = useState<string>("");
  const [targetPriceCad, setTargetPriceCad] = useState<number>(0);
  const [targetTeam, setTargetTeam] = useState<string>("");
  const [targetSector, setTargetSector] = useState<string>("Equities");
  const [targetShares, setTargetShares] = useState<number>(0);
  const [targetDollarInput, setTargetDollarInput] = useState<string>("");
  const [inputMode, setInputMode] = useState<"shares" | "dollars">("shares");

  // 4. Sell Legs State (Selling positions to fund the buy)
  const [sellLegs, setSellLegs] = useState<SellLeg[]>([]);
  const [selectedHoldingToSell, setSelectedHoldingToSell] = useState<string>("");

  // 5. Proposal Copy confirmation
  const [copiedProposal, setCopiedProposal] = useState<boolean>(false);

  // Initialize cash from storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("jsosif_fund_cash_reserve");
      if (saved) {
        const parsed = Number(saved);
        if (!isNaN(parsed) && parsed >= 0) {
          setCashBalance(parsed);
          setCashInput(parsed.toString());
        }
      }
    }
  }, []);

  const handleSaveCash = () => {
    const val = Number(cashInput);
    if (!isNaN(val) && val >= 0) {
      setCashBalance(val);
      if (typeof window !== "undefined") {
        localStorage.setItem("jsosif_fund_cash_reserve", val.toString());
      }
    }
    setIsEditingCash(false);
  };

  // Distinct Teams and Sectors
  const teams = useMemo(() => {
    return Array.from(new Set(holdings.map((h) => h.team).filter(Boolean))).sort();
  }, [holdings]);

  const sectors = useMemo(() => {
    return Array.from(
      new Set(holdings.map((h) => h.sector || h.industry).filter(Boolean))
    ).sort();
  }, [holdings]);

  // Set default target team when selectedTeam changes
  useEffect(() => {
    if (selectedTeam !== "all") {
      setTargetTeam(selectedTeam);
    } else if (teams.length > 0 && !targetTeam) {
      setTargetTeam(teams[0]);
    }
  }, [selectedTeam, teams, targetTeam]);

  // Helper formatters
  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(val)) return "$0.00";
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // When user selects an existing holding to purchase
  const handleSelectExistingToBuy = (holdingId: string) => {
    setSelectedExistingHoldingId(holdingId);
    setQuoteError(null);
    const found = holdings.find((h) => h.id === holdingId);
    if (found) {
      setTargetTicker(found.ticker || found.symbol);
      setTargetName(found.name);
      setTargetPriceCad(found.currentPrice || found.averageCost || 0);
      setTargetTeam(found.team);
      setTargetSector(found.sector || found.industry || "General");
    }
  };

  // Look up quote for ANY new ticker via /api/quote
  const handleLookupNewTicker = async (symbolToFetch?: string) => {
    const sym = (symbolToFetch || newTickerInput).trim().toUpperCase();
    if (!sym) return;

    setIsFetchingQuote(true);
    setQuoteError(null);

    try {
      const res = await fetch(`/api/quote?ticker=${encodeURIComponent(sym)}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to fetch live quote");
      }

      setTargetTicker(data.symbol);
      setTargetName(data.name);
      setTargetPriceCad(Number(data.priceCad.toFixed(2)));
      setTargetSector(data.sector || "Equities");
      if (selectedTeam !== "all") {
        setTargetTeam(selectedTeam);
      }
    } catch (err: any) {
      setQuoteError(err?.message || "Could not retrieve live price for symbol.");
    } finally {
      setIsFetchingQuote(false);
    }
  };

  // Handle share vs dollar input sync
  const handleSharesChange = (shares: number) => {
    const validShares = Math.max(0, shares);
    setTargetShares(validShares);
    if (targetPriceCad > 0) {
      setTargetDollarInput((validShares * targetPriceCad).toFixed(2));
    }
  };

  const handleDollarsChange = (dollarsStr: string) => {
    setTargetDollarInput(dollarsStr);
    const dollars = Number(dollarsStr);
    if (!isNaN(dollars) && dollars >= 0 && targetPriceCad > 0) {
      const calculatedShares = Math.floor(dollars / targetPriceCad);
      setTargetShares(calculatedShares);
    } else {
      setTargetShares(0);
    }
  };

  // Re-sync dollars if price changes
  useEffect(() => {
    if (targetPriceCad > 0 && targetShares > 0) {
      setTargetDollarInput((targetShares * targetPriceCad).toFixed(2));
    }
  }, [targetPriceCad]);

  // Sell Legs Management
  const handleAddSellLeg = () => {
    if (!selectedHoldingToSell) return;
    const holding = holdings.find((h) => h.id === selectedHoldingToSell);
    if (!holding) return;

    // Check if already in sell legs
    if (sellLegs.some((leg) => leg.holdingId === holding.id)) {
      setSelectedHoldingToSell("");
      return;
    }

    const newLeg: SellLeg = {
      id: `sell-${Date.now()}-${holding.id}`,
      holdingId: holding.id,
      ticker: holding.ticker || holding.symbol,
      name: holding.name,
      team: holding.team,
      sector: holding.sector || holding.industry || "General",
      ownedShares: holding.shares,
      currentPrice: holding.currentPrice || holding.averageCost,
      sharesToSell: Math.min(holding.shares, Math.ceil(holding.shares * 0.25)), // Default 25% trim
    };

    setSellLegs((prev) => [...prev, newLeg]);
    setSelectedHoldingToSell("");
  };

  const handleUpdateSellLegShares = (legId: string, shares: number) => {
    setSellLegs((prev) =>
      prev.map((leg) => {
        if (leg.id !== legId) return leg;
        const validShares = Math.min(leg.ownedShares, Math.max(0, shares));
        return { ...leg, sharesToSell: validShares };
      })
    );
  };

  const handleSetSellLegPercent = (legId: string, percent: number) => {
    setSellLegs((prev) =>
      prev.map((leg) => {
        if (leg.id !== legId) return leg;
        const calculated = Math.round((leg.ownedShares * percent) / 100);
        return { ...leg, sharesToSell: Math.min(leg.ownedShares, calculated) };
      })
    );
  };

  const handleRemoveSellLeg = (legId: string) => {
    setSellLegs((prev) => prev.filter((leg) => leg.id !== legId));
  };

  // FINANCIAL CALCULATIONS
  // 1. Total Purchase Value
  const totalPurchaseCost = useMemo(() => {
    return targetShares * targetPriceCad;
  }, [targetShares, targetPriceCad]);

  // 2. Gross proceeds generated from planned sells
  const totalSellProceeds = useMemo(() => {
    return sellLegs.reduce((sum, leg) => sum + leg.sharesToSell * leg.currentPrice, 0);
  }, [sellLegs]);

  // 3. Available Purchasing Power (Cash + Sells)
  const totalBuyingPower = useMemo(() => {
    return cashBalance + totalSellProceeds;
  }, [cashBalance, totalSellProceeds]);

  // 4. Feasibility Verdict & Shortfall
  const cashShortfall = useMemo(() => {
    return Math.max(0, totalPurchaseCost - totalBuyingPower);
  }, [totalPurchaseCost, totalBuyingPower]);

  const simulatedCashRemaining = useMemo(() => {
    return totalBuyingPower - totalPurchaseCost;
  }, [totalBuyingPower, totalPurchaseCost]);

  // Max affordable shares calculations
  const maxAffordableWithCashOnly = useMemo(() => {
    if (targetPriceCad <= 0) return 0;
    return Math.floor(cashBalance / targetPriceCad);
  }, [cashBalance, targetPriceCad]);

  const maxAffordableWithSells = useMemo(() => {
    if (targetPriceCad <= 0) return 0;
    return Math.floor(totalBuyingPower / targetPriceCad);
  }, [totalBuyingPower, targetPriceCad]);

  // Smart action: Auto-cover remaining shortfall with a selected holding
  const handleAutoCoverShortfallWithLeg = (legId: string) => {
    if (cashShortfall <= 0) return;
    const leg = sellLegs.find((l) => l.id === legId);
    if (!leg || leg.currentPrice <= 0) return;

    // Remaining shortfall if this leg's current sells were excluded
    const currentLegProceeds = leg.sharesToSell * leg.currentPrice;
    const shortfallWithoutLeg = cashShortfall + currentLegProceeds;
    const sharesNeeded = Math.ceil(shortfallWithoutLeg / leg.currentPrice);
    const finalShares = Math.min(leg.ownedShares, sharesNeeded);

    handleUpdateSellLegShares(legId, finalShares);
  };

  // Feasibility status evaluation
  const feasibilityStatus = useMemo(() => {
    if (totalPurchaseCost === 0) return "idle";
    if (totalPurchaseCost <= cashBalance) return "cash_ready";
    if (totalPurchaseCost <= totalBuyingPower) return "funded_by_sells";
    return "shortfall";
  }, [totalPurchaseCost, cashBalance, totalBuyingPower]);

  // "WHAT-IF" REBALANCING & ALLOCATION COMPARISONS
  const { teamComparisons, sectorComparisons, assetComparisons, totalBefore, totalAfter } =
    useMemo(() => {
      // Base totals including cash
      const baseHoldingsValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
      const baseTotalValue = baseHoldingsValue + cashBalance;

      // Post-trade simulated holdings map
      // Map holding ID -> simulated market value
      const simulatedHoldingsMap = new Map<string, number>();

      holdings.forEach((h) => {
        simulatedHoldingsMap.set(h.id, h.marketValue);
      });

      // Apply sells
      sellLegs.forEach((leg) => {
        const currentVal = simulatedHoldingsMap.get(leg.holdingId) || 0;
        const sellVal = leg.sharesToSell * leg.currentPrice;
        simulatedHoldingsMap.set(leg.holdingId, Math.max(0, currentVal - sellVal));
      });

      // Apply buy
      let targetFoundInPortfolio = false;
      holdings.forEach((h) => {
        const sym = (h.ticker || h.symbol).toUpperCase();
        if (targetTicker && sym === targetTicker.toUpperCase()) {
          targetFoundInPortfolio = true;
          const currentVal = simulatedHoldingsMap.get(h.id) || 0;
          simulatedHoldingsMap.set(h.id, currentVal + totalPurchaseCost);
        }
      });

      // Total simulated portfolio value (Equities + Bonds + Remaining Cash)
      // Note: If self-funded via cash, portfolio total value remains constant (capital reallocated).
      // If there's an unresolved shortfall, simulated cash is negative or 0.
      const simulatedCash = Math.max(0, simulatedCashRemaining);
      const simulatedHoldingsValue =
        Array.from(simulatedHoldingsMap.values()).reduce((sum, v) => sum + v, 0) +
        (!targetFoundInPortfolio && targetTicker ? totalPurchaseCost : 0);

      const simulatedTotalValue = simulatedHoldingsValue + simulatedCash;

      // 1. Division / Team Comparisons
      const teamMapBefore = new Map<string, number>();
      const teamMapAfter = new Map<string, number>();

      holdings.forEach((h) => {
        const t = h.team || "Unassigned";
        teamMapBefore.set(t, (teamMapBefore.get(t) || 0) + h.marketValue);
        const simVal = simulatedHoldingsMap.get(h.id) || 0;
        teamMapAfter.set(t, (teamMapAfter.get(t) || 0) + simVal);
      });

      // Add target buy to target team if not already in existing holding
      if (!targetFoundInPortfolio && targetTicker && targetTeam && totalPurchaseCost > 0) {
        teamMapAfter.set(targetTeam, (teamMapAfter.get(targetTeam) || 0) + totalPurchaseCost);
      }

      // Add cash as a team entry for complete 100% allocation balance
      teamMapBefore.set("Fund Cash Reserve", cashBalance);
      teamMapAfter.set("Fund Cash Reserve", simulatedCash);

      const allTeamNames = Array.from(
        new Set([...Array.from(teamMapBefore.keys()), ...Array.from(teamMapAfter.keys())])
      );

      const teamComparisonsList: AllocationItemComparison[] = allTeamNames
        .map((name, idx) => {
          const beforeVal = teamMapBefore.get(name) || 0;
          const afterVal = teamMapAfter.get(name) || 0;
          const beforePct = baseTotalValue > 0 ? (beforeVal / baseTotalValue) * 100 : 0;
          const afterPct = simulatedTotalValue > 0 ? (afterVal / simulatedTotalValue) * 100 : 0;
          return {
            name,
            beforeValue: beforeVal,
            beforePercent: beforePct,
            afterValue: afterVal,
            afterPercent: afterPct,
            deltaPercent: afterPct - beforePct,
            deltaValue: afterVal - beforeVal,
            color: name === "Fund Cash Reserve" ? "#64748B" : PALETTE[idx % PALETTE.length],
          };
        })
        .sort((a, b) => b.afterValue - a.afterValue);

      // 2. Sector / Industry Comparisons
      const sectorMapBefore = new Map<string, number>();
      const sectorMapAfter = new Map<string, number>();

      holdings.forEach((h) => {
        const s = h.sector || h.industry || "General";
        sectorMapBefore.set(s, (sectorMapBefore.get(s) || 0) + h.marketValue);
        const simVal = simulatedHoldingsMap.get(h.id) || 0;
        sectorMapAfter.set(s, (sectorMapAfter.get(s) || 0) + simVal);
      });

      if (!targetFoundInPortfolio && targetTicker && totalPurchaseCost > 0) {
        const s = targetSector || "General";
        sectorMapAfter.set(s, (sectorMapAfter.get(s) || 0) + totalPurchaseCost);
      }

      sectorMapBefore.set("Cash & Liquidity", cashBalance);
      sectorMapAfter.set("Cash & Liquidity", simulatedCash);

      const allSectorNames = Array.from(
        new Set([...Array.from(sectorMapBefore.keys()), ...Array.from(sectorMapAfter.keys())])
      );

      const sectorComparisonsList: AllocationItemComparison[] = allSectorNames
        .map((name, idx) => {
          const beforeVal = sectorMapBefore.get(name) || 0;
          const afterVal = sectorMapAfter.get(name) || 0;
          const beforePct = baseTotalValue > 0 ? (beforeVal / baseTotalValue) * 100 : 0;
          const afterPct = simulatedTotalValue > 0 ? (afterVal / simulatedTotalValue) * 100 : 0;
          return {
            name,
            beforeValue: beforeVal,
            beforePercent: beforePct,
            afterValue: afterVal,
            afterPercent: afterPct,
            deltaPercent: afterPct - beforePct,
            deltaValue: afterVal - beforeVal,
            color: name === "Cash & Liquidity" ? "#64748B" : PALETTE[(idx + 2) % PALETTE.length],
          };
        })
        .sort((a, b) => b.afterValue - a.afterValue);

      // 3. Asset Class Comparisons (Equities, Fixed Income, Cash)
      const assetMapBefore = { Equities: 0, "Fixed Income": 0, "Cash Reserve": cashBalance };
      const assetMapAfter = { Equities: 0, "Fixed Income": 0, "Cash Reserve": simulatedCash };

      holdings.forEach((h) => {
        const isBond =
          h.assetType === "Bond" ||
          h.name?.includes("%") ||
          h.ticker?.startsWith("US") ||
          h.ticker?.startsWith("CA") ||
          h.ticker?.startsWith("BAC4");

        const category = isBond ? "Fixed Income" : "Equities";
        assetMapBefore[category] += h.marketValue;
        assetMapAfter[category] += simulatedHoldingsMap.get(h.id) || 0;
      });

      if (!targetFoundInPortfolio && targetTicker && totalPurchaseCost > 0) {
        assetMapAfter.Equities += totalPurchaseCost;
      }

      const assetComparisonsList: AllocationItemComparison[] = [
        {
          name: "Equities",
          beforeValue: assetMapBefore.Equities,
          beforePercent: (assetMapBefore.Equities / baseTotalValue) * 100,
          afterValue: assetMapAfter.Equities,
          afterPercent: (assetMapAfter.Equities / simulatedTotalValue) * 100,
          deltaPercent:
            (assetMapAfter.Equities / simulatedTotalValue) * 100 -
            (assetMapBefore.Equities / baseTotalValue) * 100,
          deltaValue: assetMapAfter.Equities - assetMapBefore.Equities,
          color: "#0E5791",
        },
        {
          name: "Fixed Income",
          beforeValue: assetMapBefore["Fixed Income"],
          beforePercent: (assetMapBefore["Fixed Income"] / baseTotalValue) * 100,
          afterValue: assetMapAfter["Fixed Income"],
          afterPercent: (assetMapAfter["Fixed Income"] / simulatedTotalValue) * 100,
          deltaPercent:
            (assetMapAfter["Fixed Income"] / simulatedTotalValue) * 100 -
            (assetMapBefore["Fixed Income"] / baseTotalValue) * 100,
          deltaValue: assetMapAfter["Fixed Income"] - assetMapBefore["Fixed Income"],
          color: "#00C49F",
        },
        {
          name: "Cash Reserve",
          beforeValue: assetMapBefore["Cash Reserve"],
          beforePercent: (assetMapBefore["Cash Reserve"] / baseTotalValue) * 100,
          afterValue: assetMapAfter["Cash Reserve"],
          afterPercent: (assetMapAfter["Cash Reserve"] / simulatedTotalValue) * 100,
          deltaPercent:
            (assetMapAfter["Cash Reserve"] / simulatedTotalValue) * 100 -
            (assetMapBefore["Cash Reserve"] / baseTotalValue) * 100,
          deltaValue: assetMapAfter["Cash Reserve"] - assetMapBefore["Cash Reserve"],
          color: "#64748B",
        },
      ];

      return {
        teamComparisons: teamComparisonsList,
        sectorComparisons: sectorComparisonsList,
        assetComparisons: assetComparisonsList,
        totalBefore: baseTotalValue,
        totalAfter: simulatedTotalValue,
      };
    }, [
      holdings,
      cashBalance,
      sellLegs,
      targetTicker,
      targetTeam,
      targetSector,
      totalPurchaseCost,
      simulatedCashRemaining,
    ]);

  // Holdings available for selling (sorted by team match if filtered)
  const availableHoldingsForSell = useMemo(() => {
    const alreadySelectedIds = new Set(sellLegs.map((l) => l.holdingId));
    return holdings
      .filter((h) => !alreadySelectedIds.has(h.id))
      .sort((a, b) => {
        if (selectedTeam !== "all") {
          if (a.team === selectedTeam && b.team !== selectedTeam) return -1;
          if (b.team === selectedTeam && a.team !== selectedTeam) return 1;
        }
        return b.marketValue - a.marketValue;
      });
  }, [holdings, sellLegs, selectedTeam]);

  // Copy Investment Committee Trade Proposal summary
  const handleCopyProposal = () => {
    const lines = [
      `==================================================`,
      `JSOSIF INVESTMENT COMMITTEE — TRADE PROPOSAL`,
      `Generated: ${new Date().toLocaleDateString("en-CA")} ${new Date().toLocaleTimeString()}`,
      `Team Perspective: ${selectedTeam === "all" ? "Portfolio Manager (Fund-Wide)" : selectedTeam}`,
      `==================================================\n`,
      `[PROPOSED PURCHASE]`,
      `Asset: ${targetName || targetTicker} (${targetTicker})`,
      `Division: ${targetTeam}`,
      `Sector: ${targetSector}`,
      `Execution Price: ${formatCurrency(targetPriceCad)} CAD`,
      `Target Quantity: ${targetShares.toLocaleString()} shares`,
      `Total Capital Required: ${formatCurrency(totalPurchaseCost)} CAD\n`,
      `[PROPOSED FUNDING SOURCES]`,
      `Starting Cash Reserve: ${formatCurrency(cashBalance)} CAD`,
      `Planned Sales Proceeds: ${formatCurrency(totalSellProceeds)} CAD`,
      ...sellLegs.map(
        (leg) =>
          `  - SELL ${leg.sharesToSell} / ${leg.ownedShares} shs ${leg.ticker} (${leg.name}) @ ${formatCurrency(leg.currentPrice)} = ${formatCurrency(leg.sharesToSell * leg.currentPrice)}`
      ),
      `Total Available Buying Power: ${formatCurrency(totalBuyingPower)} CAD\n`,
      `[FEASIBILITY VERDICT]`,
      feasibilityStatus === "cash_ready"
        ? `STATUS: FULLY FUNDED VIA CASH. Surplus Cash: ${formatCurrency(simulatedCashRemaining)} CAD`
        : feasibilityStatus === "funded_by_sells"
        ? `STATUS: FULLY FUNDED VIA SIMULATED SALES. Surplus Cash: ${formatCurrency(simulatedCashRemaining)} CAD`
        : `STATUS: SHORTFALL OF ${formatCurrency(cashShortfall)} CAD. (Requires additional sales of ${formatCurrency(cashShortfall)})`,
      `\n[POST-TRADE ALLOCATION IMPACT]`,
      ...teamComparisons.map(
        (t) =>
          `  - ${t.name}: ${t.beforePercent.toFixed(1)}% -> ${t.afterPercent.toFixed(1)}% (${t.deltaPercent > 0 ? "+" : ""}${t.deltaPercent.toFixed(2)}%)`
      ),
      `==================================================`,
    ];

    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedProposal(true);
    setTimeout(() => setCopiedProposal(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Team Filter Toolbar */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#072F50] to-[#0E5791] text-white p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-400 opacity-15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-400/20 text-blue-200 border border-blue-300/20 backdrop-blur-md">
                Interactive Trade Lab
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-300/20 backdrop-blur-md">
                What-If Rebalancer
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Trade Simulator & Allocation Engine
            </h2>
            <p className="text-white/80 text-xs sm:text-sm max-w-2xl mt-1 leading-relaxed">
              Model stock purchases, test capital availability against fund cash reserves, simulate
              rebalancing exits, and verify post-trade allocation shifts before executing.
            </p>
          </div>

          {/* Team Filter & Cash Reserve Widget */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Team Selector */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-blue-200 shrink-0 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">
                  Team Focus
                </span>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer pr-4"
                >
                  <option value="all" className="bg-gray-900 text-white">
                    Fund-Wide (All Teams)
                  </option>
                  {teams.map((t) => (
                    <option key={t} value={t} className="bg-gray-900 text-white">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fund Cash Reserve Pill */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <span className="font-bold text-xs">$</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider block">
                    Fund Cash Reserve
                  </span>
                  {isEditingCash ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input
                        type="number"
                        value={cashInput}
                        onChange={(e) => setCashInput(e.target.value)}
                        className="w-24 px-1.5 py-0.5 rounded bg-black/40 text-white text-xs font-bold border border-white/30 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveCash}
                        className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[11px] font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-white">
                      {formatCurrency(cashBalance)} CAD
                    </span>
                  )}
                </div>
              </div>

              {!isEditingCash && (
                <button
                  onClick={() => setIsEditingCash(true)}
                  className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs"
                  title="Adjust current cash balance"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Trade Construction Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 1. Purchase Setup (Buy Leg) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl bg-white border border-gray-100 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-[#0E5791] font-bold text-sm flex items-center justify-center">
                  1
                </span>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Select Target Stock (Buy Leg)</h3>
                  <p className="text-xs text-gray-500">Pick an existing asset or search any market ticker</p>
                </div>
              </div>

              {/* Toggle Source: Existing Holding vs New Market Ticker */}
              <div className="inline-flex p-1 rounded-xl bg-gray-100 text-xs font-semibold text-gray-600">
                <button
                  onClick={() => {
                    setBuySourceMode("existing");
                    setQuoteError(null);
                  }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    buySourceMode === "existing"
                      ? "bg-white text-[#0E5791] shadow-sm font-bold"
                      : "hover:text-gray-900"
                  }`}
                >
                  Fund Holding
                </button>
                <button
                  onClick={() => {
                    setBuySourceMode("new");
                    setQuoteError(null);
                  }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    buySourceMode === "new"
                      ? "bg-white text-[#0E5791] shadow-sm font-bold"
                      : "hover:text-gray-900"
                  }`}
                >
                  New Ticker
                </button>
              </div>
            </div>

            {/* Asset Selection Controls */}
            {buySourceMode === "existing" ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">
                  Select Position from JSOSIF Portfolio
                </label>
                <select
                  value={selectedExistingHoldingId}
                  onChange={(e) => handleSelectExistingToBuy(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-800 text-sm font-medium focus:ring-2 focus:ring-[#0E5791] focus:outline-none"
                >
                  <option value="">-- Choose an active holding --</option>
                  {holdings.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.ticker || h.symbol} • {h.name} ({h.team}) — {formatCurrency(h.currentPrice)} CAD
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-700 block">
                  Search Any Public Ticker (US or TSX)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="e.g. NVDA, AAPL, SHOP.TO, MSFT, ATD.TO"
                      value={newTickerInput}
                      onChange={(e) => setNewTickerInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleLookupNewTicker();
                        }
                      }}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-900 uppercase font-semibold text-sm focus:ring-2 focus:ring-[#0E5791] focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleLookupNewTicker()}
                    disabled={isFetchingQuote || !newTickerInput.trim()}
                    className="px-5 py-3 rounded-2xl bg-[#0E5791] hover:bg-[#072F50] text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2 shrink-0 active:scale-95"
                  >
                    {isFetchingQuote ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Looking up...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>Fetch Quote</span>
                      </>
                    )}
                  </button>
                </div>

                {quoteError && (
                  <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                    {quoteError}
                  </p>
                )}
              </div>
            )}

            {/* Active Selected Asset Info Card */}
            {targetTicker && (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-[#0E5791]">{targetTicker}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-white text-gray-700 font-semibold border border-blue-100">
                        {targetTeam || "Investment Division"}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-white text-gray-500 font-medium border border-blue-100">
                        {targetSector}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium mt-0.5 truncate max-w-sm">
                      {targetName}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Est. Market Price</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(targetPriceCad)} CAD
                    </span>
                  </div>
                </div>

                {/* Manual Price Override or Division re-assignment */}
                <div className="pt-2 border-t border-blue-100 flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">Price Override:</span>
                    <input
                      type="number"
                      step="0.01"
                      value={targetPriceCad || ""}
                      onChange={(e) => setTargetPriceCad(Number(e.target.value) || 0)}
                      className="w-24 px-2 py-1 rounded-lg border border-gray-300 bg-white font-semibold text-gray-800 text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">Assign Division:</span>
                    <select
                      value={targetTeam}
                      onChange={(e) => setTargetTeam(e.target.value)}
                      className="px-2 py-1 rounded-lg border border-gray-300 bg-white font-semibold text-gray-800 text-xs focus:ring-1 focus:ring-blue-500"
                    >
                      {teams.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Target Quantity & Capital Calculator */}
            {targetTicker && (
              <div className="pt-3 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-700">Order Sizing Mode</span>
                  <div className="inline-flex p-0.5 rounded-lg bg-gray-100 font-semibold text-gray-600">
                    <button
                      onClick={() => setInputMode("shares")}
                      className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                        inputMode === "shares"
                          ? "bg-white text-[#0E5791] font-bold shadow-xs"
                          : "hover:text-gray-900"
                      }`}
                    >
                      By Shares
                    </button>
                    <button
                      onClick={() => setInputMode("dollars")}
                      className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                        inputMode === "dollars"
                          ? "bg-white text-[#0E5791] font-bold shadow-xs"
                          : "hover:text-gray-900"
                      }`}
                    >
                      By Dollars ($ CAD)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Shares Input */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                      Number of Shares
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={targetShares || ""}
                        onChange={(e) => handleSharesChange(Number(e.target.value))}
                        disabled={inputMode === "dollars"}
                        placeholder="0"
                        className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base font-bold text-gray-900 focus:ring-2 focus:ring-[#0E5791] focus:outline-none ${
                          inputMode === "dollars" ? "bg-gray-50 text-gray-500" : "bg-white"
                        }`}
                      />
                      <span className="absolute right-3 top-3 text-xs text-gray-400 font-medium">
                        shares
                      </span>
                    </div>
                  </div>

                  {/* Dollar Amount Input */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                      Total Capital Allocation (CAD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-sm font-bold text-gray-400">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={targetDollarInput}
                        onChange={(e) => handleDollarsChange(e.target.value)}
                        disabled={inputMode === "shares"}
                        placeholder="0.00"
                        className={`w-full pl-8 pr-12 py-2.5 rounded-xl border border-gray-200 text-base font-bold text-gray-900 focus:ring-2 focus:ring-[#0E5791] focus:outline-none ${
                          inputMode === "shares" ? "bg-gray-50 text-gray-500" : "bg-white"
                        }`}
                      />
                      <span className="absolute right-3 top-3 text-xs text-gray-400 font-medium">
                        CAD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Sizing Buttons based on Available Buying Power */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-gray-500 font-medium">Quick Alloc:</span>
                  <button
                    onClick={() => {
                      if (targetPriceCad > 0) {
                        const targetAmt = 2500;
                        handleDollarsChange(targetAmt.toString());
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                  >
                    $2.5k
                  </button>
                  <button
                    onClick={() => {
                      if (targetPriceCad > 0) {
                        const targetAmt = 5000;
                        handleDollarsChange(targetAmt.toString());
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                  >
                    $5k
                  </button>
                  <button
                    onClick={() => {
                      if (targetPriceCad > 0) {
                        const targetAmt = 10000;
                        handleDollarsChange(targetAmt.toString());
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                  >
                    $10k
                  </button>
                  <button
                    onClick={() => {
                      if (maxAffordableWithCashOnly > 0) {
                        handleSharesChange(maxAffordableWithCashOnly);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0E5791] font-bold"
                    title={`Use full starting cash (${maxAffordableWithCashOnly} shares)`}
                  >
                    Max Cash ({maxAffordableWithCashOnly} shs)
                  </button>
                  {totalSellProceeds > 0 && (
                    <button
                      onClick={() => {
                        if (maxAffordableWithSells > 0) {
                          handleSharesChange(maxAffordableWithSells);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold"
                      title={`Use cash + all planned sales proceeds (${maxAffordableWithSells} shares)`}
                    >
                      Max Power ({maxAffordableWithSells} shs)
                    </button>
                  )}
                </div>

                {/* Total Cost Summary Card */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block">
                      Target Purchase Cost
                    </span>
                    <span className="text-2xl font-black text-gray-900">
                      {formatCurrency(totalPurchaseCost)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Calculated Size</span>
                    <span className="text-xs font-bold text-gray-800">
                      {targetShares} shares @ {formatCurrency(targetPriceCad)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Cash Availability & Feasibility Status Banner */}
          <div
            className={`rounded-3xl p-6 sm:p-7 border shadow-sm transition-all ${
              feasibilityStatus === "cash_ready"
                ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                : feasibilityStatus === "funded_by_sells"
                ? "bg-sky-50/80 border-sky-200 text-sky-950"
                : feasibilityStatus === "shortfall"
                ? "bg-rose-50/80 border-rose-200 text-rose-950"
                : "bg-white border-gray-100 text-gray-900"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  feasibilityStatus === "cash_ready"
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : feasibilityStatus === "funded_by_sells"
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                    : feasibilityStatus === "shortfall"
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {feasibilityStatus === "cash_ready" ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : feasibilityStatus === "funded_by_sells" ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : feasibilityStatus === "shortfall" ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h4 className="text-lg font-extrabold tracking-tight">
                    {feasibilityStatus === "cash_ready"
                      ? "Purchasable With Cash Alone"
                      : feasibilityStatus === "funded_by_sells"
                      ? "Funded Via Planned Sells"
                      : feasibilityStatus === "shortfall"
                      ? "Cash Shortfall — Additional Sells Required"
                      : "Awaiting Order Size"}
                  </h4>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      feasibilityStatus === "cash_ready"
                        ? "bg-emerald-100 text-emerald-800"
                        : feasibilityStatus === "funded_by_sells"
                        ? "bg-sky-100 text-sky-800"
                        : feasibilityStatus === "shortfall"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {feasibilityStatus === "cash_ready"
                      ? "100% Cash Covered"
                      : feasibilityStatus === "funded_by_sells"
                      ? "Balanced Rebalance"
                      : feasibilityStatus === "shortfall"
                      ? "Underfunded"
                      : "Ready"}
                  </span>
                </div>

                <p className="text-xs leading-relaxed opacity-90 mb-4">
                  {feasibilityStatus === "cash_ready"
                    ? `The fund holds sufficient cash (${formatCurrency(cashBalance)}) to execute this purchase of ${formatCurrency(totalPurchaseCost)} without selling any existing positions. Remaining post-trade cash: ${formatCurrency(simulatedCashRemaining)} CAD.`
                    : feasibilityStatus === "funded_by_sells"
                    ? `Starting cash (${formatCurrency(cashBalance)}) was insufficient on its own, but planned sales generate an additional ${formatCurrency(totalSellProceeds)}, providing ${formatCurrency(totalBuyingPower)} total buying power. Remaining cash: ${formatCurrency(simulatedCashRemaining)} CAD.`
                    : feasibilityStatus === "shortfall"
                    ? `Total available buying power (${formatCurrency(totalBuyingPower)}) is less than the target purchase (${formatCurrency(totalPurchaseCost)}). You must sell an additional ${formatCurrency(cashShortfall)} from existing holdings or reduce target to ${maxAffordableWithSells} shares.`
                    : "Select a stock above and enter target shares or dollar allocation to evaluate cash requirements."}
                </p>

                {/* Progress bar of available capital vs purchase cost */}
                {totalPurchaseCost > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Available Capital: {formatCurrency(totalBuyingPower)}</span>
                      <span>Target: {formatCurrency(totalPurchaseCost)}</span>
                    </div>
                    <div className="h-2.5 w-full bg-black/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          feasibilityStatus === "cash_ready"
                            ? "bg-emerald-500"
                            : feasibilityStatus === "funded_by_sells"
                            ? "bg-sky-500"
                            : "bg-rose-500"
                        }`}
                        style={{
                          width: `${Math.min(100, (totalBuyingPower / totalPurchaseCost) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 2. Sells Manager (Sell Other Stocks to Fund) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl bg-white border border-gray-100 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 font-bold text-sm flex items-center justify-center">
                  2
                </span>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    Simulate Selling Holdings (Sell Legs)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Liquidate or trim positions to fund the purchase and manage allocations
                  </p>
                </div>
              </div>

              {/* Total proceeds pill */}
              <div className="text-right">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                  Sell Proceeds
                </span>
                <span className="text-sm font-extrabold text-emerald-600">
                  +{formatCurrency(totalSellProceeds)}
                </span>
              </div>
            </div>

            {/* Holding Selector to Add a Sell Leg */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">
                Add Holding to Sell / Trim
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedHoldingToSell}
                  onChange={(e) => setSelectedHoldingToSell(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-gray-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0E5791] focus:outline-none"
                >
                  <option value="">-- Choose holding to trim or sell --</option>
                  {availableHoldingsForSell.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.ticker || h.symbol} • {h.name} ({h.shares} shs @ {formatCurrency(h.currentPrice)} = {formatCurrency(h.marketValue)})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAddSellLeg}
                  disabled={!selectedHoldingToSell}
                  className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Sell</span>
                </button>
              </div>
            </div>

            {/* List of Configured Sell Legs */}
            {sellLegs.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 space-y-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h5 className="text-xs font-bold text-gray-700">No planned sales added</h5>
                <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                  If cash is short or you wish to rebalance capital away from certain stocks, select a position above to add it to your planned sell orders.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {sellLegs.map((leg) => {
                  const proceeds = leg.sharesToSell * leg.currentPrice;
                  const pctSold =
                    leg.ownedShares > 0 ? (leg.sharesToSell / leg.ownedShares) * 100 : 0;

                  return (
                    <div
                      key={leg.id}
                      className="p-4 rounded-2xl border border-gray-200 hover:border-amber-300 bg-white transition-all space-y-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-gray-900">
                              {leg.ticker}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                              {leg.team}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate max-w-xs">{leg.name}</p>
                          <span className="text-[11px] text-gray-400 mt-0.5 block">
                            Owned: {leg.ownedShares} shs @ {formatCurrency(leg.currentPrice)} CAD
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 uppercase font-bold block">
                              Proceeds
                            </span>
                            <span className="text-base font-extrabold text-emerald-600">
                              +{formatCurrency(proceeds)}
                            </span>
                          </div>

                          <button
                            onClick={() => handleRemoveSellLeg(leg.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            title="Remove sell leg"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Shares to sell slider and input */}
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 font-medium">
                            Shares to Sell:{" "}
                            <strong className="text-gray-900">
                              {leg.sharesToSell} / {leg.ownedShares} ({pctSold.toFixed(0)}%)
                            </strong>
                          </span>
                          <span className="text-gray-400 text-[11px]">
                            Remaining: {leg.ownedShares - leg.sharesToSell} shs
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max={leg.ownedShares}
                            value={leg.sharesToSell}
                            onChange={(e) =>
                              handleUpdateSellLegShares(leg.id, Number(e.target.value))
                            }
                            className="flex-1 accent-amber-600 cursor-pointer"
                          />
                          <input
                            type="number"
                            min="0"
                            max={leg.ownedShares}
                            value={leg.sharesToSell}
                            onChange={(e) =>
                              handleUpdateSellLegShares(leg.id, Number(e.target.value))
                            }
                            className="w-16 px-2 py-1 rounded-lg border border-gray-300 text-xs font-bold text-center text-gray-900 focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        {/* Quick preset buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                          <div className="flex items-center gap-1 text-[11px]">
                            {[25, 50, 75, 100].map((pct) => (
                              <button
                                key={pct}
                                onClick={() => handleSetSellLegPercent(leg.id, pct)}
                                className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                                  Math.round(pctSold) === pct
                                    ? "bg-amber-600 text-white shadow-xs"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                }`}
                              >
                                {pct === 100 ? "Full Exit" : `${pct}%`}
                              </button>
                            ))}
                          </div>

                          {/* Smart helper: cover shortfall with this holding */}
                          {cashShortfall > 0 && (
                            <button
                              onClick={() => handleAutoCoverShortfallWithLeg(leg.id)}
                              className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-md transition-all flex items-center gap-1"
                              title="Set shares to exactly cover the remaining cash shortfall"
                            >
                              <span>Cover Shortfall</span>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Investment Committee Action Card */}
          <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">
                Investment Committee (IC) Proposal
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Generate and export an executive trade memo for team presentations
              </p>
            </div>

            <button
              onClick={handleCopyProposal}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0 ${
                copiedProposal
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-gray-900 hover:bg-black text-white shadow-md shadow-gray-900/20"
              }`}
            >
              {copiedProposal ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Proposal Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  <span>Copy IC Trade Memo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Post-Trade What-If Allocation Preview */}
      <SimulatorAllocationPreview
        teamComparisons={teamComparisons}
        sectorComparisons={sectorComparisons}
        assetComparisons={assetComparisons}
        totalMarketValueBefore={totalBefore}
        totalMarketValueAfter={totalAfter}
        cashBefore={cashBalance}
        cashAfter={simulatedCashRemaining}
      />
    </div>
  );
}
