const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const id = '12345678-1234-1234-1234-123456789abc';
const points = Array.from({ length: 80 }, (_, i) => ({ date: new Date(Date.UTC(2026, 0, i + 1)).toISOString().slice(0, 10), price: 100 + i * i }));
function load(file, requireMock) {
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText;
  vm.runInNewContext(compiled, { exports, require: requireMock, Date, Map, Set, Promise, Number, Math, URL, console });
  return exports;
}
const correlation = load('src/lib/portfolio/correlation.ts');
function setup({ holdings = [{ ticker: 'AAPL', name: 'Apple', amount_in_shares: 10, costCad: 100 }], missingTeam = false, missingHistory = [] } = {}) {
  let reads = 0;
  const requested = [];
  const db = { from() {
    reads++;
    const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: missingTeam ? null : { holdings }, error: null }) };
    return query;
  } };
  const route = load('src/app/api/teams/[id]/correlation/route.ts', (name) => {
    if (name === 'next/server') return { NextResponse: { json: Response.json } };
    if (name === '@/utils/supabaseDb') return { supabaseDb: db };
    if (name === '@/lib/portfolio/correlation') return correlation;
    if (name === '@/lib/portfolio/getPriceHistory') return { getPriceHistory: async (symbol) => {
      requested.push(symbol);
      if (missingHistory.includes(symbol)) throw new Error('No history');
      return points;
    } };
    throw new Error(`Unexpected import ${name}`);
  });
  return { get: (symbol) => route.GET(new Request(`http://localhost/api?symbol=${encodeURIComponent(symbol)}`), { params: Promise.resolve({ id }) }), requested, reads: () => reads };
}

test('returns candidate comparisons and a weighted portfolio without database writes', async () => {
  const handler = setup();
  const response = await handler.get(' msft ');
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.symbol, 'MSFT');
  assert.equal(data.alreadyHeld, false);
  assert.equal(data.comparisons[0].symbol, 'AAPL');
  assert.ok(Math.abs(data.portfolio.value - 1) < 1e-12);
  assert.deepEqual(handler.requested, ['MSFT', 'AAPL']);
});

test('an existing ticker reuses its history and is marked as already held', async () => {
  const handler = setup();
  const response = await handler.get('AAPL');
  const data = await response.json();
  assert.equal(data.alreadyHeld, true);
  assert.deepEqual(handler.requested, ['AAPL']);
});

test('invalid ticker is rejected before database or market-data calls', async () => {
  const handler = setup();
  assert.equal((await handler.get('<script>')).status, 400);
  assert.equal(handler.reads(), 0);
  assert.equal(handler.requested.length, 0);
});

test('missing teams and empty portfolios return clear errors', async () => {
  assert.equal((await setup({ missingTeam: true }).get('MSFT')).status, 404);
  assert.equal((await setup({ holdings: [] }).get('MSFT')).status, 422);
});

test('unavailable candidate history returns an error rather than fabricated data', async () => {
  assert.equal((await setup({ missingHistory: ['MSFT'] }).get('MSFT')).status, 422);
});

test('missing holding history does not become a partial portfolio', async () => {
  const handler = setup({ holdings: [
    { ticker: 'AAPL', name: 'Apple', amount_in_shares: 10, costCad: 100 },
    { ticker: 'BOND', name: 'Bond', amount_in_shares: 5, costCad: 100 },
    { ticker: 'SOLD', name: 'Sold holding', amount_in_shares: 0, costCad: 100 },
  ], missingHistory: ['BOND'] });
  const response = await handler.get('MSFT');
  const data = await response.json();
  assert.equal(data.portfolio.value, null);
  assert.equal(data.comparisons.length, 2);
  assert.ok(data.comparisons[0].value !== null);
  assert.equal(data.comparisons[1].value, null);
  assert.ok(!handler.requested.includes('SOLD'));
});
