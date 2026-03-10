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
    <div className="min-h-screen bg-gray-50 pt-32 px-6 pb-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Learning Resources</h1>
        <p className="text-gray-600 mb-8">
          Curated links for research, valuation, and investment analysis.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource) => (
            <a
              key={resource.title}
              href={resource.href}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border border-gray-200 bg-white p-5 hover:border-[#0E5791] hover:shadow-sm transition"
            >
              <h2 className="text-lg font-semibold text-gray-900">{resource.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
            </a>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/homepage" className="text-[#0E5791] hover:underline">
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
