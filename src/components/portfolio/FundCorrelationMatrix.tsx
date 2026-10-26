import CorrelationMatrix from "./CorrelationMatrix";

export default function FundCorrelationMatrix() {
  return <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 space-y-5">
    <div><h2 className="text-xl font-bold text-slate-900">Whole Portfolio Correlation Matrix</h2><p className="mt-2 text-sm text-slate-500">Compare current holdings across all divisions, excluding fixed income and cash. Repeated tickers are combined, and unavailable history is shown as N/A.</p></div>
    <CorrelationMatrix teamId="whole-portfolio" endpoint="/api/portfolio/correlation" allowPdfExport emptyMessage="There are no current holdings to compare after excluding fixed income and cash." />
  </section>;
}
