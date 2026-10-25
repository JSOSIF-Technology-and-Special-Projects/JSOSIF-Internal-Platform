export const PROPOSAL_STATUSES = ["draft", "pending", "approved", "rejected"] as const;
export type ProposalStatus = typeof PROPOSAL_STATUSES[number];
export interface TradeLeg {
  side: "buy" | "sell";
  symbol: string;
  name: string;
  shares: number;
  priceCad: number;
  team: string;
  sector: string;
}
export interface AllocationSnapshot { name: string; beforePercent: number; afterPercent: number }
export interface ProposalIpsWarning {
  rule: "single_stock" | "fixed_income" | "sector" | "cash";
  message: string;
}
export interface SimulationSnapshot {
  generatedAt: string;
  cashBefore: number;
  cashAfter: number;
  buyCost: number;
  sellProceeds: number;
  fundCapital: number;
  teams: AllocationSnapshot[];
  sectors: AllocationSnapshot[];
  assets: AllocationSnapshot[];
  stockExposure?: { symbol: string; afterPercent: number };
  ipsWarnings?: ProposalIpsWarning[];
}

// Capture violations using the simulator's existing limits, not a full IPS certification.
export function proposalIpsWarnings(snapshot: SimulationSnapshot): ProposalIpsWarning[] {
  const warnings: ProposalIpsWarning[] = [];
  if (snapshot.stockExposure && snapshot.stockExposure.afterPercent > 10) warnings.push({ rule: "single_stock", message: `${snapshot.stockExposure.symbol} would represent ${snapshot.stockExposure.afterPercent.toFixed(2)}% of the fund, exceeding the 10% single-stock limit.` });
  const fixedIncome = snapshot.assets.find(row => /fixed income|bond/i.test(row.name)) || snapshot.teams.find(row => /fixed income|bond/i.test(row.name));
  if (fixedIncome && (fixedIncome.afterPercent < 30 || fixedIncome.afterPercent > 44)) warnings.push({ rule: "fixed_income", message: `Fixed income would represent ${fixedIncome.afterPercent.toFixed(1)}% of the fund, outside the 30–44% IPS range.` });
  for (const sector of snapshot.sectors) {
    if (!/cash|fixed|bond/i.test(sector.name) && sector.afterPercent > 25) warnings.push({ rule: "sector", message: `${sector.name} would represent ${sector.afterPercent.toFixed(1)}% of the fund, exceeding the 25% equity-sector limit.` });
  }
  const cash = snapshot.assets.find(row => /cash/i.test(row.name));
  const cashPercent = cash?.afterPercent ?? snapshot.cashAfter / snapshot.fundCapital * 100;
  if (cashPercent > 10) warnings.push({ rule: "cash", message: `Cash would represent ${cashPercent.toFixed(1)}% of the fund, exceeding the 10% IPS cash limit.` });
  return warnings;
}
export type NotificationStatus = "not_sent" | "sending" | "sent" | "failed";
export interface TradeProposal {
  id: string;
  authorId: string;
  authorName: string;
  status: ProposalStatus;
  legs: TradeLeg[];
  simulation: SimulationSnapshot;
  reason: string;
  reviewNote: string;
  reviewerName: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  notificationStatus: NotificationStatus;
  notificationAttemptedAt: string | null;
  notifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface ProposalViewer { id: string; name: string; canReview: boolean; approvalConfigured: boolean; approverName: string | null; notificationTestEmail: string | null }
export function isCeoDescription(value: unknown): boolean {
  return typeof value === "string" && /^(?:chief\s+executive\s+officer|ceo)(?=\s*(?:$|[(&,/–—-]))/i.test(value.trim());
}
export const isProposalId = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
export const isProposalStatus = (value: string): value is ProposalStatus => PROPOSAL_STATUSES.some(status => status === value);
export const statusLabel = (status: ProposalStatus) => ({ draft: "Draft", pending: "Pending review", approved: "Approved", rejected: "Rejected" })[status];
export const proposalMoney = (value: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(value);
export const proposalDate = (value: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

function text(value: unknown, max: number, optional = false): string | null {
  if (optional && value === undefined) return "";
  return typeof value === "string" && value.trim().length <= max && (optional || Boolean(value.trim())) ? value.trim() : null;
}
function amount(value: unknown, positive = false): value is number {
  return typeof value === "number" && Number.isFinite(value) && value <= Number.MAX_SAFE_INTEGER && (positive ? value > 0 : value >= 0);
}
function allocations(value: unknown): AllocationSnapshot[] | null {
  if (!Array.isArray(value) || value.length > 100) return null;
  const result: AllocationSnapshot[] = [];
  for (const row of value) {
    if (!isRecord(row)) return null;
    const name = text(row.name, 255);
    if (!name || typeof row.beforePercent !== "number" || !Number.isFinite(row.beforePercent) || typeof row.afterPercent !== "number" || !Number.isFinite(row.afterPercent)) return null;
    result.push({ name, beforePercent: row.beforePercent, afterPercent: row.afterPercent });
  }
  return result;
}

export function parseProposalDraft(input: unknown): { data: { id: string; legs: TradeLeg[]; simulation: SimulationSnapshot } } | { error: string } {
  if (!isRecord(input) || !isProposalId(input.id) || !Array.isArray(input.legs) || input.legs.length === 0 || input.legs.length > 100) return { error: "Choose between 1 and 100 valid trade legs." };
  const legs: TradeLeg[] = [];
  for (const leg of input.legs) {
    if (!isRecord(leg)) return { error: "Invalid trade details." };
    const symbol = text(leg.symbol, 40), name = text(leg.name, 255), team = text(leg.team, 255, true), sector = text(leg.sector, 255, true);
    if ((leg.side !== "buy" && leg.side !== "sell") || !symbol || !name || team === null || sector === null || !amount(leg.shares, true) || !amount(leg.priceCad, true)) return { error: "Each trade needs a ticker, positive shares, and a positive CAD price." };
    legs.push({ side: leg.side, symbol: symbol.toUpperCase(), name, team, sector, shares: leg.shares, priceCad: leg.priceCad });
  }
  const snapshot = input.simulation;
  if (!isRecord(snapshot) || !amount(snapshot.cashBefore) || !amount(snapshot.fundCapital, true) || typeof snapshot.generatedAt !== "string" || snapshot.generatedAt.length > 40 || !Number.isFinite(Date.parse(snapshot.generatedAt))) return { error: "The simulation snapshot is invalid. Refresh the simulator and try again." };
  const teams = allocations(snapshot.teams), sectors = allocations(snapshot.sectors), assets = allocations(snapshot.assets);
  if (!teams || !sectors || !assets) return { error: "The allocation snapshot is invalid." };
  let stockExposure: SimulationSnapshot["stockExposure"];
  if (snapshot.stockExposure !== undefined) {
    const exposure = snapshot.stockExposure;
    if (!isRecord(exposure)) return { error: "The stock exposure snapshot is invalid." };
    const symbol = text(exposure.symbol, 40);
    if (!symbol || !amount(exposure.afterPercent) || !legs.some(leg => leg.side === "buy" && leg.symbol === symbol.toUpperCase())) return { error: "The stock exposure snapshot is invalid." };
    stockExposure = { symbol: symbol.toUpperCase(), afterPercent: exposure.afterPercent };
  }
  const total = (side: TradeLeg["side"]) => legs.filter(leg => leg.side === side).reduce((sum, leg) => sum + leg.shares * leg.priceCad, 0);
  const buyCost = total("buy"), sellProceeds = total("sell");
  if (!amount(buyCost) || !amount(sellProceeds) || !Number.isFinite(snapshot.cashBefore + sellProceeds - buyCost) || Math.abs(snapshot.cashBefore + sellProceeds - buyCost) > Number.MAX_SAFE_INTEGER) return { error: "The proposed trade amounts are too large." };
  const simulation: SimulationSnapshot = { generatedAt: new Date(snapshot.generatedAt).toISOString(), cashBefore: snapshot.cashBefore, fundCapital: snapshot.fundCapital, cashAfter: snapshot.cashBefore + sellProceeds - buyCost, buyCost, sellProceeds, teams, sectors, assets, ...(stockExposure ? { stockExposure } : {}) };
  // Derive messages on the server from validated estimates; ignore client-supplied warnings.
  simulation.ipsWarnings = proposalIpsWarnings(simulation);
  return { data: { id: input.id, legs, simulation } };
}
