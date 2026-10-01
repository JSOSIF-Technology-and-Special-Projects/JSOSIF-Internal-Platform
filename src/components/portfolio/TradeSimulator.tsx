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

const DEFAULT_CASH_BALANCE = 10171;

const STANDARD_SECTORS = [
  "Financial Institutions",
  "Tech, Media, & Telecommunications",
  "Consumer & Retail",
  "Industrials & Natural Resources",
  "Healthcare",
  "Fixed Income",
];

export default function TradeSimulator({
  holdings,
  totalMarketValue,
  initialTeam,
}: TradeSimulatorProps) {
  // 1. Team perspective filter
  const [selectedTeam, setSelectedTeam] = useState<string>(initialTeam || "all");

  // Separate non-cash equity/bond holdings from cash reserve (removes Executives as cash)
  const nonCashHoldings = useMemo(() => {
    return holdings.filter(
      (h) =>
        h.ticker !== "CASH" &&
        h.ticker !== "CAD.CASH" &&
        h.assetType !== "Cash" &&
        h.team !== "Executives" &&
        h.team !== "Cash" &&
        h.sector !== "Cash & Liquidity" &&
        h.sector !== "Cash & Equivalents"
    );
  }, [holdings]);

  const cashHolding = useMemo(() => {
    return holdings.find(
      (h) =>
        h.ticker === "CASH" ||
        h.ticker === "CAD.CASH" ||
        h.assetType === "Cash" ||
        h.team === "Executives" ||
        h.team === "Cash"
    );
  }, [holdings]);

  // 2. Fund Cash Reserve (Loaded directly from database, strictly READ-ONLY in Trade Simulator)
  const [cashBalance, setCashBalance] = useState<number>(() => {
    if (cashHolding) {
      return Number(cashHolding.marketValue || cashHolding.costCad || DEFAULT_CASH_BALANCE);
    }
    return DEFAULT_CASH_BALANCE;
  });

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
  const [targetSector, setTargetSector] = useState<string>("");
  const [targetShares, setTargetShares] = useState<number>(0);
  const [targetDollarInput, setTargetDollarInput] = useState<string>("");
  const [inputMode, setInputMode] = useState<"shares" | "dollars">("shares");

  // 4. Sell Legs State (Selling positions to fund the buy)
  const [sellLegs, setSellLegs] = useState<SellLeg[]>([]);
  const [selectedHoldingToSell, setSelectedHoldingToSell] = useState<string>("");

  // 5. Proposal Copy confirmation & Advanced Buy toggle
  const [copiedProposal, setCopiedProposal] = useState<boolean>(false);
  const [showAdvancedBuy, setShowAdvancedBuy] = useState<boolean>(false);

  // Initialize cash from database
  useEffect(() => {
    async function loadDbCash() {
      try {
        const res = await fetch("/api/portfolio/cash");
        if (res.ok) {
          const data = await res.json();
          if (data?.cashBalance !== undefined && !isNaN(Number(data.cashBalance))) {
            const val = Number(data.cashBalance);
            setCashBalance(val);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to load cash from database:", err);
      }
    }

    loadDbCash();
  }, []);

  // Distinct Investment Teams (strictly excludes Cash and Executives)
  const teams = useMemo(() => {
    return Array.from(
      new Set(
        nonCashHoldings
          .map((h) => h.team)
          .filter(
            (t) =>
              Boolean(t) &&
              t !== "Executives" &&
              t !== "Cash" &&
              t !== "Fund Cash Reserve" &&
              t !== "Unassigned"
          )
      )
    ).sort();
  }, [nonCashHoldings]);

  // Available Sectors (Institutional Standards + existing portfolio sectors)
  const sectors = useMemo(() => {
    const existing = nonCashHoldings
      .map((h) => h.sector || h.industry)
      .filter((s) => Boolean(s) && s !== "Cash & Liquidity" && s !== "Cash & Equivalents");
    return Array.from(new Set([...STANDARD_SECTORS, ...existing])).sort();
  }, [nonCashHoldings]);

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

  // Auto-sync team when sector is manually typed or chosen
  const autoSyncTeamFromSector = useCallback(
    (sectorName: string) => {
      const s = sectorName.toLowerCase().trim();
      if (!s) return;
      if (s.includes("financial") || s.includes("fig") || s.includes("bank") || s.includes("insurance")) {
        const match = teams.find((t) => t.toLowerCase().includes("financial") || t.toLowerCase().includes("fig"));
        if (match) setTargetTeam(match);
      } else if (
        s.includes("tech") ||
        s.includes("tmt") ||
        s.includes("media") ||
        s.includes("telecom") ||
        s.includes("software")
      ) {
        const match = teams.find((t) => t.toLowerCase().includes("tech") || t.toLowerCase().includes("tmt"));
        if (match) setTargetTeam(match);
      } else if (s.includes("consumer") || s.includes("retail") || s.includes("cr")) {
        const match = teams.find(
          (t) => t.toLowerCase().includes("consumer") || t.toLowerCase().includes("retail") || t.toLowerCase().includes("cr")
        );
        if (match) setTargetTeam(match);
      } else if (
        s.includes("industrial") ||
        s.includes("natural") ||
        s.includes("resource") ||
        s.includes("energy") ||
        s.includes("ei") ||
        s.includes("materials")
      ) {
        const match = teams.find(
          (t) => t.toLowerCase().includes("industrial") || t.toLowerCase().includes("natural") || t.toLowerCase().includes("ei")
        );
        if (match) setTargetTeam(match);
      } else if (s.includes("health") || s.includes("pharma") || s.includes("hc") || s.includes("biotech")) {
        const match = teams.find((t) => t.toLowerCase().includes("health") || t.toLowerCase().includes("hc"));
        if (match) setTargetTeam(match);
      } else if (s.includes("bond") || s.includes("fixed")) {
        const match = teams.find((t) => t.toLowerCase().includes("fixed") || t.toLowerCase().includes("bond"));
        if (match) setTargetTeam(match);
      }
    },
    [teams]
  );

  // Clear the active Buy Leg state
  const handleClearBuyLeg = useCallback(() => {
    setSelectedExistingHoldingId("");
    setNewTickerInput("");
    setQuoteError(null);
    setTargetTicker("");
    setTargetName("");
    setTargetPriceCad(0);
    setTargetShares(0);
    setTargetDollarInput("");
    setTargetSector("");
    if (selectedTeam !== "all") {
      setTargetTeam(selectedTeam);
    } else if (teams.length > 0) {
      setTargetTeam(teams[0]);
    }
    setShowAdvancedBuy(false);
  }, [selectedTeam, teams]);

  // Handle switching between "Fund Holding" and "New Ticker" (clears the box automatically)
  const handleSwitchBuySourceMode = (mode: "existing" | "new") => {
    if (mode === buySourceMode) return;
    setBuySourceMode(mode);
    handleClearBuyLeg();
  };

  // Full Clear All function (clears the entire buy and sell section)
  const handleClearAll = useCallback(() => {
    handleClearBuyLeg();
    setSellLegs([]);
    setSelectedHoldingToSell("");
  }, [handleClearBuyLeg]);

  // When user selects an existing holding to purchase
  const handleSelectExistingToBuy = (holdingId: string) => {
    setSelectedExistingHoldingId(holdingId);
    setQuoteError(null);
    const found = nonCashHoldings.find((h) => h.id === holdingId);
    if (found) {
      setTargetTicker(found.ticker || found.symbol);
      setTargetName(found.name);
      setTargetPriceCad(found.currentPrice || found.averageCost || 0);
      setTargetTeam(found.team);
      const chosenSector = found.sector || found.industry || "";
      setTargetSector(chosenSector);
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
      // Do not default to USD or arbitrary sector; keep blank if not a valid sector string
      const incomingSector =
        data.sector && data.sector !== "USD" && data.sector !== "CAD"
          ? data.sector
          : "";
      setTargetSector(incomingSector);
      if (incomingSector) {
        autoSyncTeamFromSector(incomingSector);
      }
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
    const holding = nonCashHoldings.find((h) => h.id === selectedHoldingToSell);
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

  // Total Fund Capital (Pure Investment Holdings + Live Cash Reserve, no double counting)
  const fundCapital = useMemo(() => {
    const nonCashValue = nonCashHoldings.reduce((sum, h) => sum + h.marketValue, 0);
    const val = nonCashValue + (cashBalance || 0);
    return val > 0 ? val : 250000;
  }, [nonCashHoldings, cashBalance]);

  // Check if target is already in the portfolio to show combined post-trade weight
  const existingHoldingMatch = useMemo(() => {
    if (!targetTicker) return null;
    return nonCashHoldings.find(
      (h) =>
        (h.ticker && h.ticker.toUpperCase() === targetTicker.toUpperCase()) ||
        (h.symbol && h.symbol.toUpperCase() === targetTicker.toUpperCase()) ||
        h.id === selectedExistingHoldingId
    );
  }, [nonCashHoldings, targetTicker, selectedExistingHoldingId]);

  const existingPositionValue = useMemo(() => {
    if (!existingHoldingMatch) return 0;
    return existingHoldingMatch.marketValue || existingHoldingMatch.shares * (existingHoldingMatch.currentPrice || existingHoldingMatch.averageCost || 0);
  }, [existingHoldingMatch]);

  const postTradeTotalStockValue = existingPositionValue + totalPurchaseCost;
  const postTradeStockWeightPct = fundCapital > 0 ? (postTradeTotalStockValue / fundCapital) * 100 : 0;
  const tradeOnlyWeightPct = fundCapital > 0 ? (totalPurchaseCost / fundCapital) * 100 : 0;

  // IPS Risk-Based Position Sizing Tiers (from Min / Low Risk to 10% IPS Max Limit)
  const ipsAllocationTiers = useMemo(() => {
    return [
      {
        id: "min-starter",
        risk: "Low Risk",
        name: "Min / Starter",
        percent: 1.5,
        dollars: Math.round((fundCapital * 1.5) / 100),
        description: "1.5% of fund — Low risk starter / defensive sizing",
      },
      {
        id: "conservative",
        risk: "Conservative",
        name: "Conservative",
        percent: 3.0,
        dollars: Math.round((fundCapital * 3.0) / 100),
        description: "3.0% of fund — Moderate risk standard weighting",
      },
      {
        id: "core-target",
        risk: "Core",
        name: "Core Position",
        percent: 5.0,
        dollars: Math.round((fundCapital * 5.0) / 100),
        description: "5.0% of fund — Balanced core institutional target weight",
      },
      {
        id: "high-conviction",
        risk: "High Risk",
        name: "High Conviction",
        percent: 7.5,
        dollars: Math.round((fundCapital * 7.5) / 100),
        description: "7.5% of fund — High conviction strategic growth allocation",
      },
      {
        id: "ips-max",
        risk: "10% Cap",
        name: "IPS Max Limit",
        percent: 10.0,
        dollars: Math.round((fundCapital * 10.0) / 100),
        description: "10.0% of fund — Maximum single holding limit mandated by IPS Section 14",
      },
    ];
  }, [fundCapital]);

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
      // Base totals including cash (using pure non-cash investments to prevent double counting)
      const baseHoldingsValue = nonCashHoldings.reduce((sum, h) => sum + h.marketValue, 0);
      const baseTotalValue = baseHoldingsValue + cashBalance;

      // Track existing holdings after sells
      const holdingsAfterSellsMap = new Map<string, number>();
      nonCashHoldings.forEach((h) => {
        const soldLeg = sellLegs.find((leg) => leg.holdingId === h.id);
        const soldAmount = soldLeg ? soldLeg.sharesToSell * soldLeg.currentPrice : 0;
        holdingsAfterSellsMap.set(h.id, Math.max(0, h.marketValue - soldAmount));
      });

      // Total simulated portfolio value (Equities + Bonds + Remaining Cash)
      const simulatedCash = Math.max(0, simulatedCashRemaining);
      const simulatedHoldingsValue =
        Array.from(holdingsAfterSellsMap.values()).reduce((sum, v) => sum + v, 0) +
        (targetTicker ? totalPurchaseCost : 0);

      const simulatedTotalValue = simulatedHoldingsValue + simulatedCash;

      // 1. Division / Team Comparisons (pure investment teams + single Cash Reserve)
      const teamMapBefore = new Map<string, number>();
      const teamMapAfter = new Map<string, number>();

      nonCashHoldings.forEach((h) => {
        const t = h.team || "Unassigned";
        teamMapBefore.set(t, (teamMapBefore.get(t) || 0) + h.marketValue);
        const postSellVal = holdingsAfterSellsMap.get(h.id) || 0;
        teamMapAfter.set(t, (teamMapAfter.get(t) || 0) + postSellVal);
      });

      // Add target buy to target team
      if (targetTicker && targetTeam && totalPurchaseCost > 0) {
        teamMapAfter.set(targetTeam, (teamMapAfter.get(targetTeam) || 0) + totalPurchaseCost);
      }

      // Add cash reserve once (never as Executives)
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

      nonCashHoldings.forEach((h) => {
        const s = h.sector || h.industry || "General";
        sectorMapBefore.set(s, (sectorMapBefore.get(s) || 0) + h.marketValue);
        const postSellVal = holdingsAfterSellsMap.get(h.id) || 0;
        sectorMapAfter.set(s, (sectorMapAfter.get(s) || 0) + postSellVal);
      });

      // Add target buy directly to user's selected/manually inputted targetSector
      if (targetTicker && totalPurchaseCost > 0) {
        const s = (targetSector || "General").trim();
        sectorMapAfter.set(s, (sectorMapAfter.get(s) || 0) + totalPurchaseCost);
      }

      // Add cash as a sector entry once
      sectorMapBefore.set("Cash & Equivalents", cashBalance);
      sectorMapAfter.set("Cash & Equivalents", simulatedCash);

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
            color: name === "Cash & Equivalents" ? "#64748B" : PALETTE[(idx + 2) % PALETTE.length],
          };
        })
        .sort((a, b) => b.afterValue - a.afterValue);

      // 3. Asset Class Comparisons (Equities, Fixed Income, Cash)
      const assetMapBefore = { Equities: 0, "Fixed Income": 0, "Cash Reserve": cashBalance };
      const assetMapAfter = { Equities: 0, "Fixed Income": 0, "Cash Reserve": simulatedCash };

      nonCashHoldings.forEach((h) => {
        const isBond =
          h.assetType === "Bond" ||
          h.name?.includes("%") ||
          h.ticker?.startsWith("US") ||
          h.ticker?.startsWith("CA") ||
          h.ticker?.startsWith("BAC4");

        const category = isBond ? "Fixed Income" : "Equities";
        assetMapBefore[category] += h.marketValue;
        const postSellVal = holdingsAfterSellsMap.get(h.id) || 0;
        assetMapAfter[category] += postSellVal;
      });

      if (targetTicker && totalPurchaseCost > 0) {
        const isBond =
          targetSector?.toLowerCase().includes("bond") ||
          targetSector?.toLowerCase().includes("fixed") ||
          targetTeam?.toLowerCase().includes("bond") ||
          targetTeam?.toLowerCase().includes("fixed");

        if (isBond) {
          assetMapAfter["Fixed Income"] += totalPurchaseCost;
        } else {
          assetMapAfter.Equities += totalPurchaseCost;
        }
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
      nonCashHoldings,
      cashBalance,
      sellLegs,
      targetTicker,
      targetTeam,
      targetSector,
      totalPurchaseCost,
      simulatedCashRemaining,
    ]);

  // Holdings available for selling (pure investment holdings, sorted by team match if filtered)
  const availableHoldingsForSell = useMemo(() => {
    const alreadySelectedIds = new Set(sellLegs.map((l) => l.holdingId));
    return nonCashHoldings
      .filter((h) => !alreadySelectedIds.has(h.id))
      .sort((a, b) => {
        if (selectedTeam !== "all") {
          if (a.team === selectedTeam && b.team !== selectedTeam) return -1;
          if (b.team === selectedTeam && a.team !== selectedTeam) return 1;
        }
        return b.marketValue - a.marketValue;
      });
  }, [nonCashHoldings, sellLegs, selectedTeam]);

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
    <div className="space-y-6 sm:space-y-7">
      {/* 1. Header & Rebalancing Controls Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#072F50] to-[#0E5791] text-white p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-400 opacity-10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Trade Simulator & Portfolio Rebalancer
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mt-1 leading-relaxed">
              Simulate stock acquisitions, test liquidity against fund cash reserves or planned sales, and verify post-trade allocation shifts before trade execution.
            </p>
          </div>

          {/* Team Filter & Fund Cash Reserve Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Team Focus Selector */}
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
                  className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer pr-3"
                >
                  <option value="all" className="bg-slate-900 text-white">
                    Fund-Wide (All Teams)
                  </option>
                  {teams.map((t) => (
                    <option key={t} value={t} className="bg-slate-900 text-white">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fund Cash Reserve Widget (Authoritative from Database, Read-Only) */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <span className="font-bold text-xs">$</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider block">
                      Fund Cash Reserve
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30">
                      Bank Confirmed
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white">
                    {formatCurrency(cashBalance)} CAD
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Unified Funding & Capital Feasibility Status Bar */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                feasibilityStatus === "cash_ready"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : feasibilityStatus === "funded_by_sells"
                  ? "bg-sky-50 text-sky-600 border border-sky-200"
                  : feasibilityStatus === "shortfall"
                  ? "bg-amber-50 text-amber-600 border border-amber-200"
                  : "bg-slate-50 text-slate-500 border border-slate-200"
              }`}
            >
              {feasibilityStatus === "cash_ready" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : feasibilityStatus === "funded_by_sells" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : feasibilityStatus === "shortfall" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  {feasibilityStatus === "cash_ready"
                    ? "Purchase Fully Covered by Starting Cash"
                    : feasibilityStatus === "funded_by_sells"
                    ? "Balanced Rebalance (Cash + Planned Sells)"
                    : feasibilityStatus === "shortfall"
                    ? "Capital Shortfall — Additional Sells Required"
                    : "Order Simulation Ready"}
                </h3>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    feasibilityStatus === "cash_ready"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : feasibilityStatus === "funded_by_sells"
                      ? "bg-sky-50 text-sky-700 border border-sky-200"
                      : feasibilityStatus === "shortfall"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {feasibilityStatus === "cash_ready"
                    ? "100% Cash Ready"
                    : feasibilityStatus === "funded_by_sells"
                    ? "Rebalance Balanced"
                    : feasibilityStatus === "shortfall"
                    ? "Underfunded"
                    : "Draft"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {feasibilityStatus === "cash_ready"
                  ? `Fund holds sufficient cash to execute ${formatCurrency(totalPurchaseCost)} with ${formatCurrency(simulatedCashRemaining)} surplus remaining.`
                  : feasibilityStatus === "funded_by_sells"
                  ? `Starting cash plus ${formatCurrency(totalSellProceeds)} from planned sales provides ${formatCurrency(totalBuyingPower)} total buying power.`
                  : feasibilityStatus === "shortfall"
                  ? `Need additional sales of ${formatCurrency(cashShortfall)} or reduce target quantity to ${maxAffordableWithSells} shares.`
                  : "Select an asset and enter shares or dollar size to evaluate liquidity requirements."}
              </p>
            </div>
          </div>

          {/* Quick stats in bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-5 text-right self-stretch lg:self-center pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Target Cost
              </span>
              <span className="text-sm font-extrabold text-slate-900">
                {formatCurrency(totalPurchaseCost)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Cash Reserve
              </span>
              <span className="text-sm font-bold text-slate-700">
                {formatCurrency(cashBalance)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Planned Sells
              </span>
              <span className="text-sm font-bold text-emerald-600">
                +{formatCurrency(totalSellProceeds)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Net Post-Trade Cash
              </span>
              <span
                className={`text-sm font-extrabold ${
                  simulatedCashRemaining >= 0 ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {formatCurrency(simulatedCashRemaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress ratio bar */}
        {totalPurchaseCost > 0 && (
          <div className="pt-3 flex items-center gap-3 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold shrink-0">Capital Ratio:</span>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="bg-[#0E5791] h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (Math.min(cashBalance, totalPurchaseCost) / totalPurchaseCost) * 100)}%` }}
                title={`Cash: ${formatCurrency(Math.min(cashBalance, totalPurchaseCost))}`}
              />
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100 - Math.min(100, (Math.min(cashBalance, totalPurchaseCost) / totalPurchaseCost) * 100),
                    (totalSellProceeds / totalPurchaseCost) * 100
                  )}%`,
                }}
                title={`Sells: ${formatCurrency(totalSellProceeds)}`}
              />
            </div>
            <span className="text-slate-500 font-bold text-[11px] shrink-0">
              {Math.min(100, Math.round((totalBuyingPower / totalPurchaseCost) * 100))}%
            </span>
          </div>
        )}
      </div>

      {/* 3. Main Two-Column Order Builder Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
              Trade Builder & Funding Allocator
            </span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              (Configure purchase on the left, optional sales to fund on the right)
            </span>
          </div>

          {(Boolean(targetTicker) ||
            sellLegs.length > 0 ||
            Boolean(selectedExistingHoldingId) ||
            Boolean(newTickerInput) ||
            targetShares > 0 ||
            Boolean(targetDollarInput) ||
            Boolean(selectedHoldingToSell)) && (
            <button
              onClick={handleClearAll}
              type="button"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs cursor-pointer"
              title="Reset entire simulator workspace (clears all buy and sell selections)"
            >
              <svg className="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear All (Buy & Sell)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Target Acquisition (Buy Leg) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-blue-50 text-[#0E5791] font-extrabold text-sm flex items-center justify-center border border-blue-100/60">
                    1
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Select Target Stock (Buy Leg)</h3>
                    <p className="text-xs text-slate-500">Pick an active holding to expand or search any market ticker</p>
                  </div>
                </div>

                {/* Toggle Source: Existing Holding vs New Market Ticker */}
                <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/60 text-xs font-semibold text-slate-600">
                  <button
                    onClick={() => handleSwitchBuySourceMode("existing")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      buySourceMode === "existing"
                        ? "bg-white text-[#0E5791] shadow-xs font-bold"
                        : "hover:text-slate-900"
                    }`}
                  >
                    Fund Holding
                  </button>
                  <button
                    onClick={() => handleSwitchBuySourceMode("new")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      buySourceMode === "new"
                        ? "bg-white text-[#0E5791] shadow-xs font-bold"
                        : "hover:text-slate-900"
                    }`}
                  >
                    New Ticker
                  </button>
                </div>
              </div>

            {/* Asset Selection Controls */}
            {buySourceMode === "existing" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-[#0E5791] text-white flex items-center justify-center text-[10px] font-black">
                    1
                  </span>
                  <span>Select Position from JSOSIF Portfolio</span>
                </label>
                <select
                  value={selectedExistingHoldingId}
                  onChange={(e) => handleSelectExistingToBuy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0E5791] focus:outline-none"
                >
                  <option value="">-- Choose an active holding --</option>
                  {nonCashHoldings.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.ticker || h.symbol} • {h.name} ({h.team}) — {formatCurrency(h.currentPrice)} CAD
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-[#0E5791] text-white flex items-center justify-center text-[10px] font-black">
                    1
                  </span>
                  <span>Search Any Public Ticker (US or TSX)</span>
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
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 uppercase font-semibold text-xs sm:text-sm focus:ring-2 focus:ring-[#0E5791] focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleLookupNewTicker()}
                    disabled={isFetchingQuote || !newTickerInput.trim()}
                    className="px-4 py-2.5 rounded-2xl bg-[#0E5791] hover:bg-[#072F50] text-white font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 active:scale-95"
                  >
                    {isFetchingQuote ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Looking up...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            {/* 2. Destination Sector Manual Input & Selector (Only for New Tickers) */}
            {buySourceMode === "new" && (
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#0E5791] text-white flex items-center justify-center text-[10px] font-black">
                      2
                    </span>
                    <span>Destination Sector</span>
                    <span className="text-[10px] font-semibold text-[#0E5791] bg-blue-100/70 px-2 py-0.5 rounded-full">
                      Manual Input
                    </span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {targetTicker
                      ? targetSector
                        ? `Allocates ${targetTicker} into ${targetSector}`
                        : `Assign destination sector for ${targetTicker}`
                      : "Select or type sector"}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    list="standard-sectors-datalist"
                    value={targetSector}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTargetSector(val);
                      autoSyncTeamFromSector(val);
                    }}
                    placeholder="Select a preset below or type sector (e.g., Tech, Media, & Telecommunications)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#0E5791] focus:outline-none placeholder:text-slate-400 placeholder:font-normal shadow-2xs"
                  />
                  <datalist id="standard-sectors-datalist">
                    {STANDARD_SECTORS.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>

                {/* Quick Preset Sector Chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {STANDARD_SECTORS.map((s) => {
                    const isSelected = Boolean(targetSector) && targetSector?.trim().toLowerCase() === s.toLowerCase();
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setTargetSector(s);
                          autoSyncTeamFromSector(s);
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                          isSelected
                            ? "bg-[#0E5791] text-white shadow-xs font-bold"
                            : "bg-white hover:bg-slate-200 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Selected Asset Info Card */}
            {targetTicker && (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-[#0E5791]">{targetTicker}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-white text-slate-700 font-semibold border border-blue-100">
                        {targetTeam || "Investment Division"}
                      </span>
                      {targetSector && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-white text-slate-500 font-medium border border-blue-100">
                          {targetSector}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5 truncate max-w-sm">
                      {targetName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Est. Market Price</span>
                      <span className="text-base sm:text-lg font-bold text-slate-900">
                        {formatCurrency(targetPriceCad)} CAD
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearBuyLeg}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                      title="Clear / Deselect this asset"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Collapsible Advanced Settings (Price Override & Division Assignment) */}
                <div className="pt-2 border-t border-blue-100">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedBuy(!showAdvancedBuy)}
                    className="text-xs font-semibold text-[#0E5791] hover:text-[#072F50] flex items-center gap-1.5 py-0.5 transition-colors"
                  >
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvancedBuy ? "rotate-90" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Advanced: Price Override & Division Assignment</span>
                  </button>

                  {showAdvancedBuy && (
                    <div className="mt-2.5 pt-2 border-t border-blue-100/60 flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">Price Override:</span>
                        <input
                          type="number"
                          step="0.01"
                          value={targetPriceCad || ""}
                          onChange={(e) => setTargetPriceCad(Number(e.target.value) || 0)}
                          className="w-24 px-2 py-1 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">Assign Division:</span>
                        <select
                          value={targetTeam}
                          onChange={(e) => setTargetTeam(e.target.value)}
                          className="px-2 py-1 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
                        >
                          {teams.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Target Quantity & Capital Calculator */}
            {targetTicker && (
              <div className="pt-2 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#0E5791] text-white flex items-center justify-center text-[10px] font-black">
                      {buySourceMode === "new" ? "3" : "2"}
                    </span>
                    <span>Order Sizing Mode</span>
                  </span>
                  <div className="inline-flex p-0.5 rounded-lg bg-slate-100 font-semibold text-slate-600">
                    <button
                      onClick={() => setInputMode("shares")}
                      className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                        inputMode === "shares"
                          ? "bg-white text-[#0E5791] font-bold shadow-xs"
                          : "hover:text-slate-900"
                      }`}
                    >
                      By Shares
                    </button>
                    <button
                      onClick={() => setInputMode("dollars")}
                      className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                        inputMode === "dollars"
                          ? "bg-white text-[#0E5791] font-bold shadow-xs"
                          : "hover:text-slate-900"
                      }`}
                    >
                      By Dollars ($ CAD)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Shares Input */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
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
                        className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#0E5791] focus:outline-none ${
                          inputMode === "dollars" ? "bg-slate-50 text-slate-500" : "bg-white"
                        }`}
                      />
                      <span className="absolute right-3 top-3 text-xs text-slate-400 font-medium">
                        shares
                      </span>
                    </div>
                  </div>

                  {/* Dollar Amount Input */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Total Capital Allocation (CAD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">
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
                        className={`w-full pl-8 pr-12 py-2.5 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#0E5791] focus:outline-none ${
                          inputMode === "shares" ? "bg-slate-50 text-slate-500" : "bg-white"
                        }`}
                      />
                      <span className="absolute right-3 top-3 text-xs text-slate-400 font-medium">
                        CAD
                      </span>
                    </div>
                  </div>
                </div>

                {/* IPS Mandate Sizing: Low Risk Min to 10% IPS Max Cap */}
                <div className="pt-2 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800">IPS Mandate Sizing:</span>
                      <span className="text-[11px] text-slate-500">
                        Low risk (min) to 10% IPS max cap
                      </span>
                    </div>
                    {totalPurchaseCost > 0 && fundCapital > 0 && (
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          postTradeStockWeightPct > 10.0
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : postTradeStockWeightPct >= 5.0
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {existingPositionValue > 0
                          ? `Total Position: ${postTradeStockWeightPct.toFixed(1)}% of Fund`
                          : `Order: ${tradeOnlyWeightPct.toFixed(1)}% of Fund`}
                      </span>
                    )}
                  </div>

                  {/* 5 Risk Tiers: Min Low Risk to 10% IPS Max Cap */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
                    {ipsAllocationTiers.map((tier) => {
                      const isSelected =
                        targetPriceCad > 0 &&
                        Math.abs(totalPurchaseCost - tier.dollars) < Math.max(50, targetPriceCad * 1.2);

                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => {
                            if (targetPriceCad > 0) {
                              handleDollarsChange(tier.dollars.toString());
                            }
                          }}
                          title={tier.description}
                          className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                            isSelected
                              ? "bg-[#0E5791] text-white border-[#0E5791] shadow-sm font-bold ring-2 ring-blue-300"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                            {tier.risk}
                          </span>
                          <span className="text-xs font-black">
                            {tier.percent}%
                          </span>
                          <span className={`text-[10px] ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                            ~{formatCurrency(tier.dollars).replace(".00", "")}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Liquidity Limits & IPS Rule Reminder */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-slate-400 text-[11px] font-medium mr-0.5">Liquidity:</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (maxAffordableWithCashOnly > 0) {
                            handleSharesChange(maxAffordableWithCashOnly);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0E5791] font-bold text-[11px] border border-blue-200/60 transition-colors"
                        title={`Use all starting cash balance (${maxAffordableWithCashOnly} shares)`}
                      >
                        Max Cash ({maxAffordableWithCashOnly} shs)
                      </button>

                      {totalSellProceeds > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (maxAffordableWithSells > 0) {
                              handleSharesChange(maxAffordableWithSells);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200/60 transition-colors"
                          title={`Use cash + planned sales proceeds (${maxAffordableWithSells} shares)`}
                        >
                          Max Power ({maxAffordableWithSells} shs)
                        </button>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 italic">
                      IPS Section 14: Single-stock max 10.0% cap
                    </span>
                  </div>
                </div>

                {/* Total Cost Summary Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider block">
                        Target Purchase Cost
                      </span>
                      {totalPurchaseCost > 0 && fundCapital > 0 && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            postTradeStockWeightPct > 10.0
                              ? "bg-rose-100 text-rose-800"
                              : "bg-blue-100 text-[#0E5791]"
                          }`}
                        >
                          {tradeOnlyWeightPct.toFixed(2)}% of Portfolio ({formatCurrency(fundCapital)} Capital)
                        </span>
                      )}
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-slate-900">
                      {formatCurrency(totalPurchaseCost)}
                    </span>
                    {existingPositionValue > 0 && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        Current: {formatCurrency(existingPositionValue)} ({((existingPositionValue / fundCapital) * 100).toFixed(1)}%) → Combined: <strong>{formatCurrency(postTradeTotalStockValue)} ({postTradeStockWeightPct.toFixed(1)}%)</strong>
                        {postTradeStockWeightPct > 10.0 && (
                          <span className="text-rose-600 font-bold ml-1.5">⚠️ Exceeds 10% IPS Limit!</span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Calculated Size</span>
                    <span className="text-xs font-bold text-slate-800">
                      {targetShares} shares @ {formatCurrency(targetPriceCad)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: 2. Sells Manager (Sell Other Stocks to Fund) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 font-extrabold text-sm flex items-center justify-center border border-amber-200/60">
                  2
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Simulate Selling Holdings (Sell Legs)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Liquidate or trim positions to fund the purchase and manage allocations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {sellLegs.length > 0 && (
                  <button
                    onClick={() => setSellLegs([])}
                    type="button"
                    className="px-2.5 py-1 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all flex items-center gap-1 active:scale-95 shadow-2xs"
                    title="Clear all sell legs"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Clear Sells</span>
                  </button>
                )}

                {/* Total proceeds pill */}
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Sell Proceeds
                  </span>
                  <span className="text-sm font-extrabold text-emerald-600">
                    +{formatCurrency(totalSellProceeds)}
                  </span>
                </div>
              </div>
            </div>

            {/* Holding Selector to Add a Sell Leg */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Add Holding to Sell / Trim
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedHoldingToSell}
                  onChange={(e) => setSelectedHoldingToSell(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0E5791] focus:outline-none"
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
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Sell</span>
                </button>
              </div>
            </div>

            {/* List of Configured Sell Legs */}
            {sellLegs.length === 0 ? (
              <div className="p-7 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h5 className="text-xs font-bold text-slate-700">No planned sales added</h5>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Sales are optional if starting cash covers the order. Select a position above to simulate trimming or rebalancing away from existing stocks.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sellLegs.map((leg) => {
                  const proceeds = leg.sharesToSell * leg.currentPrice;
                  const pctSold =
                    leg.ownedShares > 0 ? (leg.sharesToSell / leg.ownedShares) * 100 : 0;

                  return (
                    <div
                      key={leg.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-amber-300 bg-white transition-all space-y-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">
                              {leg.ticker}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {leg.team}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate max-w-xs">{leg.name}</p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">
                            Owned: {leg.ownedShares} shs @ {formatCurrency(leg.currentPrice)} CAD
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">
                              Proceeds
                            </span>
                            <span className="text-sm sm:text-base font-extrabold text-emerald-600">
                              +{formatCurrency(proceeds)}
                            </span>
                          </div>

                          <button
                            onClick={() => handleRemoveSellLeg(leg.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            title="Remove sell leg"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Shares to sell slider and input */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">
                            Shares to Sell:{" "}
                            <strong className="text-slate-900">
                              {leg.sharesToSell} / {leg.ownedShares} ({pctSold.toFixed(0)}%)
                            </strong>
                          </span>
                          <span className="text-slate-400 text-[11px]">
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
                            className="w-16 px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold text-center text-slate-900 focus:ring-1 focus:ring-amber-500"
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
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
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
          <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Investment Committee (IC) Memo
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Export consolidated trade summary memo for team presentations
              </p>
            </div>

            <button
              onClick={handleCopyProposal}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0 ${
                copiedProposal
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
              }`}
            >
              {copiedProposal ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Proposal Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      </div>

      {/* 4. Post-Trade What-If Allocation Preview */}
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
