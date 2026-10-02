export interface PricePoint {
  date: string;
  price: number | null;
}

export interface CorrelationCell {
  value: number | null;
  observations: number;
}

export const MIN_CORRELATION_OBSERVATIONS = 30;

export function extendCorrelationMatrix(matrix: CorrelationCell[][], comparisons: CorrelationCell[], self: CorrelationCell): CorrelationCell[][] {
  return [
    ...matrix.map((row, index) => [...row, comparisons[index]]),
    [...comparisons, self],
  ];
}

export function correlationWindow(now = new Date()) {
  const end = new Date(now);
  end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setUTCFullYear(start.getUTCFullYear() - 1);
  return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
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
