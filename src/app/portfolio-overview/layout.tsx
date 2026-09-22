import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fund Portfolio Overview | JSOSIF",
  description:
    "Comprehensive portfolio overview, capital allocation, and performance metrics across JSOSIF investment teams.",
};

export default function PortfolioOverviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full">{children}</section>;
}
