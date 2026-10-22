"use client";

import { useState, type FormEvent } from "react";

export default function TradeSubmissionsPage() {
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("This form is a preview. Your proposal has not been saved or sent.");
  }

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0E5791] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50";

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8">
          <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-[#0E5791]">Open to all members</span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">Trade Submissions</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">Have an investment idea? Propose a buy or sell and share the reasoning behind it. Any logged-in user can submit a proposal.</p>
        </section>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">Submit a trade proposal</h2>
          <p className="mt-1 text-sm text-slate-500">All fields are required. Submissions are not enabled yet.</p>
          <fieldset className="mt-6 space-y-6">
            <div>
              <label htmlFor="stockName" className="mb-2 block text-sm font-semibold">Stock name</label>
              <input id="stockName" name="stockName" required maxLength={255} placeholder="e.g. Apple (AAPL)" className={inputClass} />
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Trade type</legend>
              <div className="grid grid-cols-2 gap-3">
                {(["buy", "sell"] as const).map((type) => (
                  <label key={type} className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${tradeType === type ? (type === "buy" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-rose-300 bg-rose-50 text-rose-700") : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                    <input type="radio" name="tradeType" value={type} checked={tradeType === type} onChange={() => setTradeType(type)} className="accent-[#0E5791]" />
                    {type === "buy" ? "Buy" : "Sell"}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="amount" className="mb-2 block text-sm font-semibold">Amount (shares)</label>
              <input id="amount" name="amount" type="number" required min="0.000001" max="999999999999" step="0.000001" placeholder="e.g. 100" aria-describedby="amount-help" className={inputClass} />
              <p id="amount-help" className="mt-2 text-xs text-slate-500">Enter the number of shares you propose to {tradeType}.</p>
            </div>
            <div>
              <label htmlFor="reason" className="mb-2 block text-sm font-semibold">Reason for the trade</label>
              <textarea id="reason" name="reason" required maxLength={5000} rows={6} placeholder="Explain your investment thesis, what supports it, and any key risks…" className={`${inputClass} resize-y`} />
            </div>
          </fieldset>
          {notice && <p role="status" className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-[#0E5791]">{notice}</p>}
          <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xs text-xs leading-relaxed text-slate-500">Submitting a proposal does not execute a trade or change portfolio holdings.</p>
            <button type="submit" className="rounded-xl bg-[#0E5791] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0a4370] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E5791]">Submit proposal</button>
          </div>
        </form>
      </div>
    </main>
  );
}
