import { proposalDate, proposalIpsWarnings, proposalMoney, type TradeProposal } from "@/lib/trades/proposals";

export default function ProposalSnapshot({ proposal }: { proposal: TradeProposal }) {
  const snapshot = proposal.simulation;
  const ipsWarnings = snapshot.ipsWarnings ?? proposalIpsWarnings(snapshot);
  return <div className="space-y-4">
    {ipsWarnings.length > 0 && <section aria-label="Attached IPS violations" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
      <h3 className="font-bold">IPS violations flagged in this simulation</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5">{ipsWarnings.map((warning, index) => <li key={`${warning.rule}-${index}`}>{warning.message}</li>)}</ul>
      <p className="mt-3 text-xs text-rose-800">Captured when this simulation was saved. These estimates require review by the CEO.</p>
    </section>}
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Proposed buy and sell legs</caption>
        <thead className="bg-slate-50 text-xs text-slate-600"><tr><th className="p-3">Trade</th><th className="p-3">Stock / division</th><th className="p-3 text-right">Shares</th><th className="p-3 text-right">Price CAD</th><th className="p-3 text-right">Value CAD</th></tr></thead>
        <tbody>{proposal.legs.map((leg, index) => <tr key={index} className="border-t border-slate-100">
          <td className={`p-3 font-bold ${leg.side === "buy" ? "text-emerald-700" : "text-rose-700"}`}>{leg.side.toUpperCase()}</td>
          <td className="p-3"><strong>{leg.symbol}</strong><p className="text-xs text-slate-500">{leg.name}{leg.team && ` · ${leg.team}`}</p></td>
          <td className="p-3 text-right tabular-nums">{leg.shares.toLocaleString("en-CA", { maximumFractionDigits: 6 })}</td>
          <td className="whitespace-nowrap p-3 text-right tabular-nums">{proposalMoney(leg.priceCad)}</td>
          <td className="whitespace-nowrap p-3 text-right tabular-nums">{proposalMoney(leg.shares * leg.priceCad)}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-4">
      {[['Starting cash', snapshot.cashBefore], ['Planned buys', snapshot.buyCost], ['Planned sales', snapshot.sellProceeds], ['Cash after', snapshot.cashAfter]].map(([label, value]) => <div key={String(label)}><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-bold tabular-nums">{proposalMoney(Number(value))}</p></div>)}
    </div>
    {snapshot.cashAfter < 0 && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Funding shortfall: {proposalMoney(-snapshot.cashAfter)}. This proposal needs additional funding or a smaller purchase.</p>}
    <details className="rounded-xl border border-slate-200 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-[#0E5791]">View simulation and allocation snapshot</summary>
      <p className="mt-3 text-xs text-slate-500">Generated {proposalDate(snapshot.generatedAt)} ET · Estimated fund capital {proposalMoney(snapshot.fundCapital)}. These are simulator estimates captured when the draft was created; prices and holdings may have changed.</p>
      {([['Divisions', snapshot.teams], ['Sectors', snapshot.sectors], ['Asset classes', snapshot.assets]] as const).map(([label, rows]) => rows.length > 0 && <div key={label} className="mt-4">
        <h3 className="text-sm font-bold">{label}</h3>
        <dl className="mt-2 space-y-2 text-xs">{rows.map((row, index) => <div key={index} className="flex justify-between gap-3"><dt>{row.name}</dt><dd className="shrink-0 tabular-nums">{row.beforePercent.toFixed(1)}% → {row.afterPercent.toFixed(1)}%</dd></div>)}</dl>
      </div>)}
    </details>
  </div>;
}
