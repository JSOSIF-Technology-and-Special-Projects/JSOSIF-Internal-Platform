export interface PricePoint {
  date: string;
  price: number | null;
}

export interface CorrelationCell {
  value: number | null;
  observations: number;
}

export const MIN_CORRELATION_OBSERVATIONS = 30;
export const MAX_ADDED_CORRELATION_STOCKS = 10;
export const CORRELATION_PERIODS = [
  { value: "3m", label: "3 months", months: 3 },
  { value: "6m", label: "6 months", months: 6 },
  { value: "1y", label: "1 year", months: 12 },
  { value: "3y", label: "3 years", months: 36 },
] as const;
export type CorrelationPreset = typeof CORRELATION_PERIODS[number]["value"];
export type CorrelationPeriod = CorrelationPreset | "custom";

export function isCorrelationPeriod(value: string): value is CorrelationPeriod {
  return value === "custom" || CORRELATION_PERIODS.some((period) => period.value === value);
}

export function extendCorrelationMatrix(matrix: CorrelationCell[][], comparisons: CorrelationCell[], self: CorrelationCell): CorrelationCell[][] {
  return [
    ...matrix.map((row, index) => [...row, comparisons[index]]),
    [...comparisons, self],
  ];
}

export function correlationWindow(now = new Date(), period: CorrelationPreset = "1y") {
  const end = new Date(now);
  end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end);
  const months = CORRELATION_PERIODS.find((option) => option.value === period)!.months;
  start.setUTCMonth(start.getUTCMonth() - months, 1);
  const lastDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate();
  start.setUTCDate(Math.min(end.getUTCDate(), lastDay));
  return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
}

// Price history uses an exclusive end; date pickers and labels use inclusive dates.
export function correlationInclusiveEndDate(endDate: string) {
  const end = new Date(`${endDate}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() - 1);
  return end.toISOString().slice(0, 10);
}

export function resolveCorrelationWindow(query: URLSearchParams, now = new Date()): { startDate: string; endDate: string } | { error: string } {
  const period = query.get("period") ?? "1y";
  if (!isCorrelationPeriod(period)) return { error: "Choose a valid period: 3m, 6m, 1y, 3y, or custom." };
  if (period !== "custom") {
    if (query.has("startDate") || query.has("endDate")) return { error: "Choose Custom dates to use a start and end date." };
    return correlationWindow(now, period);
  }

  const startDate = query.get("startDate") ?? "";
  const inclusiveEnd = query.get("endDate") ?? "";
  const validDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };
  if (!validDate(startDate) || !validDate(inclusiveEnd)) return { error: "Choose valid start and end dates." };
  if (startDate >= inclusiveEnd) return { error: "The start date must be before the end date." };
  const latestEnd = correlationInclusiveEndDate(correlationWindow(now).endDate);
  if (inclusiveEnd > latestEnd) return { error: `Choose an end date on or before ${latestEnd} so only completed days are included.` };

  const end = new Date(`${inclusiveEnd}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 1);
  return { startDate, endDate: end.toISOString().slice(0, 10) };
}

// Constant weights, using only periods available for every constituent.
export function weightedPortfolioReturns(series: Map<string, number>[], weights: number[]): Map<string, number> {
  const result = new Map<string, number>();
  if (series.length === 0 || series.length !== weights.length || weights.some((weight) => !Number.isFinite(weight) || weight <= 0)) return result;
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (!Number.isFinite(total) || total <= 0) return result;
  for (const period of series[0].keys()) {
    const values = series.map((returns) => returns.get(period));
    if (values.some((value) => value === undefined || !Number.isFinite(value))) continue;
    result.set(period, values.reduce<number>((sum, value, index) => sum + value! * (weights[index] / total), 0));
  }
  return result;
}

// Match both endpoints so a multi-day return is never paired with a one-day return.
export function dailyReturns(points: PricePoint[]): Map<string, number> {
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const returns = new Map<string, number>();
  for (let index = 1; index < sorted.length; index++) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (previous.date === current.date || previous.price === null || current.price === null) continue;
    if (!Number.isFinite(previous.price) || !Number.isFinite(current.price) || previous.price <= 0 || current.price <= 0) continue;
    const value = current.price / previous.price - 1;
    if (Number.isFinite(value)) returns.set(`${previous.date}/${current.date}`, value);
  }
  return returns;
}

export function correlate(left: Map<string, number>, right: Map<string, number>): CorrelationCell {
  const pairs: [number, number][] = [];
  for (const [period, value] of left) {
    const other = right.get(period);
    if (other !== undefined && Number.isFinite(value) && Number.isFinite(other)) pairs.push([value, other]);
  }
  const observations = pairs.length;
  if (observations < MIN_CORRELATION_OBSERVATIONS) return { value: null, observations };
  const meanLeft = pairs.reduce((sum, pair) => sum + pair[0], 0) / observations;
  const meanRight = pairs.reduce((sum, pair) => sum + pair[1], 0) / observations;
  let covariance = 0;
  let varianceLeft = 0;
  let varianceRight = 0;
  for (const [x, y] of pairs) {
    covariance += (x - meanLeft) * (y - meanRight);
    varianceLeft += (x - meanLeft) ** 2;
    varianceRight += (y - meanRight) ** 2;
  }
  const denominator = Math.sqrt(varianceLeft) * Math.sqrt(varianceRight);
  if (!Number.isFinite(denominator) || denominator === 0) return { value: null, observations };
  const value = covariance / denominator;
  return { value: Number.isFinite(value) ? Math.max(-1, Math.min(1, value)) : null, observations };
}

export function correlationMatrix(series: PricePoint[][]): CorrelationCell[][] {
  const returns = series.map(dailyReturns);
  return returns.map((left) => returns.map((right) => correlate(left, right)));
}
