export const WATCHLIST_STATUSES = ["watching", "researching", "ready_to_pitch", "archived"] as const;
export type WatchlistStatus = typeof WATCHLIST_STATUSES[number];
export const watchlistStatusLabel = (status: WatchlistStatus) => ({ watching: "Watching", researching: "Researching", ready_to_pitch: "Ready to pitch", archived: "Archived" })[status];
export interface WatchlistTeam { id: string; name: string }
export interface WatchlistViewer { id: string; name: string; teamId: string | null; isAdmin: boolean }
export interface WatchlistEntry {
  id: string; teamId: string; symbol: string; companyName: string; sector: string;
  notes: string; targetPriceCad: number | null; status: WatchlistStatus;
  authorId: string; authorName: string; updatedByName: string;
  createdAt: string; updatedAt: string;
}
export interface WatchlistQuote {
  symbol: string; name: string; sector: string; currency: string;
  price: number; priceCad: number | null; changePercent: number | null;
  marketTime: string | null; fetchedAt: string;
}
export const watchlistId = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export const watchlistSymbol = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const symbol = value.trim().toUpperCase();
  return /^[A-Z0-9][A-Z0-9.\-]{0,39}$/.test(symbol) ? symbol : null;
};
export const isWatchlistStatus = (value: unknown): value is WatchlistStatus => WATCHLIST_STATUSES.some(status => status === value);
export const canManageWatchlist = (viewer: WatchlistViewer, teamId: string) => viewer.isAdmin || viewer.teamId === teamId;
export const watchlistMoney = (amount: number, currency = "CAD") => new Intl.NumberFormat("en-CA", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: amount > 0 && amount < 1 ? 6 : 2 }).format(amount);
export const watchlistDate = (value: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export function watchlistFields(input: unknown): { data: { notes: string; targetPriceCad: number | null; status: WatchlistStatus; sector?: string } } | { error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { error: "Invalid watchlist entry." };
  const value = input as Record<string, unknown>;
  if (typeof value.notes !== "string" || !value.notes.trim() || value.notes.trim().length > 5000) return { error: "Add a research note of up to 5,000 characters." };
  if (!isWatchlistStatus(value.status)) return { error: "Choose a valid watchlist status." };
  const price = value.targetPriceCad;
  if (price !== null && (typeof price !== "number" || !Number.isFinite(price) || price <= 0 || price > 1e12)) return { error: "Target price must be a positive CAD amount, or left blank." };
  const rounded = price === null ? null : Math.round(price * 1e6) / 1e6;
  if (rounded !== null && rounded <= 0) return { error: "Target price must be at least 0.000001 CAD." };
  if (value.sector !== undefined && (typeof value.sector !== "string" || value.sector.trim().length > 120)) return { error: "Sector must be no more than 120 characters." };
  return { data: { notes: value.notes.trim(), targetPriceCad: rounded, status: value.status, ...(typeof value.sector === "string" ? { sector: value.sector.trim() } : {}) } };
}
