const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/lib/portfolio/correlation.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
}).outputText;
const moduleContext = { exports: {} };
vm.runInNewContext(compiled, { exports: moduleContext.exports, Map, Number, Math });
const { dailyReturns, correlate, correlationMatrix } = moduleContext.exports;
const series = (transform = (value) => value) => new Map(Array.from({ length: 40 }, (_, index) => [`period-${index}`, transform(index / 100)]));

test('perfect positive and negative relationships, with symmetry', () => {
  const left = series();
  const positive = series((value) => 2 * value + 1);
  const negative = series((value) => -value);
  assert.ok(Math.abs(correlate(left, positive).value - 1) < 1e-12);
  assert.ok(Math.abs(correlate(left, negative).value + 1) < 1e-12);
  assert.equal(correlate(left, positive).value, correlate(positive, left).value);
});

test('zero correlation for orthogonal returns', () => {
  const left = new Map(Array.from({ length: 40 }, (_, i) => [String(i), [1, -1, 1, -1][i % 4]]));
  const right = new Map(Array.from({ length: 40 }, (_, i) => [String(i), [1, 1, -1, -1][i % 4]]));
  assert.equal(correlate(left, right).value, 0);
});

test('uses matching periods only and enforces minimum observations', () => {
  const right = new Map([...series()].slice(0, 29));
  const result = correlate(series(), right);
  assert.equal(result.value, null);
  assert.equal(result.observations, 29);
  right.set('period-29', 0.29);
  assert.equal(correlate(series(), right).value, 1);
});

test('constant or absent returns are unavailable rather than zero correlation', () => {
  assert.equal(correlate(series(() => 0), series()).value, null);
  assert.equal(correlate(new Map(), new Map()).value, null);
});

test('sorts prices and computes percentage returns, not price-level correlation', () => {
  const result = dailyReturns([{ date: '2026-01-03', price: 99 }, { date: '2026-01-01', price: 100 }, { date: '2026-01-02', price: 110 }]);
  assert.ok(Math.abs(result.get('2026-01-01/2026-01-02') - 0.1) < 1e-12);
  assert.ok(Math.abs(result.get('2026-01-02/2026-01-03') + 0.1) < 1e-12);
});

test('does not bridge invalid prices or pair different return intervals', () => {
  const left = dailyReturns([{ date: '2026-01-01', price: 100 }, { date: '2026-01-02', price: null }, { date: '2026-01-03', price: 110 }]);
  assert.equal(left.size, 0);
  const multiDay = dailyReturns([{ date: '2026-01-01', price: 100 }, { date: '2026-01-03', price: 110 }]);
  const daily = dailyReturns([{ date: '2026-01-02', price: 100 }, { date: '2026-01-03', price: 110 }]);
  assert.equal(correlate(multiDay, daily).observations, 0);
});

test('rejects nonpositive and nonfinite prices', () => {
  for (const price of [0, -1, NaN, Infinity]) {
    assert.equal(dailyReturns([{ date: '2026-01-01', price }, { date: '2026-01-02', price: 100 }]).size, 0);
  }
});

test('matrix diagonal is one only with sufficient varying return history', () => {
  const points = Array.from({ length: 41 }, (_, i) => ({ date: new Date(Date.UTC(2025, 0, i + 1)).toISOString().slice(0, 10), price: 100 + i * i }));
  const matrix = correlationMatrix([points, []]);
  assert.equal(matrix[0][0].value, 1);
  assert.equal(matrix[0][1].value, null);
  assert.equal(matrix[1][0].value, null);
  assert.equal(matrix[1][1].value, null);
});

const { weightedPortfolioReturns, correlationWindow } = moduleContext.exports;

test('portfolio returns normalize weights and retain only shared periods', () => {
  const first = new Map([['a', 0.1], ['b', -0.1], ['c', 0.2]]);
  const second = new Map([['a', 0.2], ['b', 0.1]]);
  const result = weightedPortfolioReturns([first, second], [3, 1]);
  assert.equal(result.size, 2);
  assert.ok(Math.abs(result.get('a') - 0.125) < 1e-12);
  assert.ok(Math.abs(result.get('b') + 0.05) < 1e-12);
});

test('portfolio cannot silently exclude unavailable holdings or invalid weights', () => {
  assert.equal(weightedPortfolioReturns([series(), new Map()], [1, 1]).size, 0);
  for (const weight of [0, -1, NaN, Infinity]) {
    assert.equal(weightedPortfolioReturns([series()], [weight]).size, 0);
  }
  assert.equal(weightedPortfolioReturns([series()], []).size, 0);
});

test('candidate is compared to the weighted portfolio, not average correlations', () => {
  const candidate = series();
  const portfolio = weightedPortfolioReturns([series(), series((value) => -value)], [3, 1]);
  assert.ok(Math.abs(correlate(candidate, portfolio).value - 1) < 1e-12);
});

test('comparison window excludes current day and spans a year', () => {
  const result = correlationWindow(new Date('2026-10-01T15:30:00Z'));
  assert.equal(result.startDate, '2025-10-01');
  assert.equal(result.endDate, '2026-10-01');
});

test('temporary stock extends both axes symmetrically without changing the original matrix', () => {
  const one = { value: 1, observations: 40 };
  const cross = { value: 0.25, observations: 35 };
  const matrix = [[one, cross], [cross, one]];
  const comparisons = [{ value: -0.5, observations: 32 }, { value: null, observations: 12 }];
  const result = moduleContext.exports.extendCorrelationMatrix(matrix, comparisons, one);
  assert.equal(result.length, 3);
  assert.equal(result[0].length, 3);
  assert.equal(result[0][2], result[2][0]);
  assert.equal(result[1][2], result[2][1]);
  assert.equal(result[2][2].value, 1);
  assert.equal(result[0][0], matrix[0][0]);
  assert.equal(matrix.length, 2);
  assert.equal(matrix[0].length, 2);
});
