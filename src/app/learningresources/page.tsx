import Link from "next/link";

const resources = [
  {
    title: "Bloomberg Market Concepts",
    description: "Core markets, economics, and fixed-income primer.",
    href: "https://www.bloomberg.com/professional/product/bloomberg-market-concepts/",
  },
  {
    title: "SEC Filings",
    description: "Search official company filings and disclosures.",
    href: "https://www.sec.gov/edgar/search/",
  },
  {
    title: "Investopedia",
    description: "Reference library for investing and valuation concepts.",
    href: "https://www.investopedia.com/",
  },
  {
    title: "Damodaran Data",
    description: "Public valuation datasets and industry benchmarks.",
    href: "https://pages.stern.nyu.edu/~adamodar/",
  },
];

export default function LearningResourcesPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0E5791] border border-blue-100 mb-2">
            Research & Education
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Learning Resources</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Curated investment databases, regulatory portals, and valuation primers for JSOSIF research analysts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource) => (
            <a
              key={resource.title}
              href={resource.href}
              target="_blank"
              rel="noreferrer"
              className="group block rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-slate-300/90 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0E5791] via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#0E5791] transition-colors">{resource.title}</h2>
                <svg className="w-4 h-4 text-slate-400 group-hover:text-[#0E5791] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{resource.description}</p>
            </a>
          ))}
        </div>

        <div className="pt-2">
          <Link href="/homepage" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E5791] hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
