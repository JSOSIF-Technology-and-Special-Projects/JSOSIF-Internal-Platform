import { prisma } from "../src/utils/prisma";

type HoldingSeed = {
  teamName: string;
  ticker: string;
  name: string;
  amountInShares: number;
  costCad: number;
  industry?: string;
};

const holdings: HoldingSeed[] = [
  { teamName: "Financial Institutions", ticker: "V", name: "Visa Inc.", amountInShares: 100, costCad: 295.67, industry: "Financial Services" },
  { teamName: "Financial Institutions", ticker: "SCHW", name: "Charles Schwab", amountInShares: 120, costCad: 68.92, industry: "Financial Services" },
  { teamName: "Financial Institutions", ticker: "JPM", name: "JPMorgan Chase", amountInShares: 80, costCad: 185.43, industry: "Banking" },
  { teamName: "Financial Institutions", ticker: "BMO", name: "Bank of Montreal", amountInShares: 90, costCad: 98.76, industry: "Banking" },
  { teamName: "Tech, Media & Telecommunications", ticker: "ACN", name: "Accenture PLC", amountInShares: 60, costCad: 345.22, industry: "Technology" },
  { teamName: "Tech, Media & Telecommunications", ticker: "CSCO", name: "Cisco Systems Inc.", amountInShares: 140, costCad: 52.18, industry: "Technology" },
  { teamName: "Tech, Media & Telecommunications", ticker: "OTEX", name: "Open Text Corp", amountInShares: 130, costCad: 42.67, industry: "Technology" },
  { teamName: "Tech, Media & Telecommunications", ticker: "DIS", name: "Walt Disney Company", amountInShares: 70, costCad: 98.45, industry: "Media" },
  { teamName: "Consumer & Retail", ticker: "LVMHF", name: "LVMH Moet Hennessy", amountInShares: 20, costCad: 842.5, industry: "Consumer" },
  { teamName: "Consumer & Retail", ticker: "PEP", name: "PepsiCo Inc.", amountInShares: 100, costCad: 168.45, industry: "Consumer" },
  { teamName: "Consumer & Retail", ticker: "JWEL", name: "Jamieson Wellness", amountInShares: 220, costCad: 28.67, industry: "Consumer" },
  { teamName: "Consumer & Retail", ticker: "GIS", name: "General Mills Inc.", amountInShares: 150, costCad: 67.89, industry: "Consumer" },
  { teamName: "Consumer & Retail", ticker: "COST", name: "Costco Wholesale", amountInShares: 40, costCad: 912.34, industry: "Consumer" },
  { teamName: "Consumer & Retail", ticker: "ATD", name: "Alimentation Couche-Tard", amountInShares: 90, costCad: 78.23, industry: "Consumer" },
  { teamName: "Industrials & Natural Resources", ticker: "ENB", name: "Enbridge Inc.", amountInShares: 180, costCad: 59.45, industry: "Energy" },
  { teamName: "Industrials & Natural Resources", ticker: "CNQ", name: "Canadian Natural Resources", amountInShares: 190, costCad: 44.78, industry: "Energy" },
  { teamName: "Industrials & Natural Resources", ticker: "J", name: "Jacobs Solutions Inc.", amountInShares: 55, costCad: 138.23, industry: "Industrials" },
  { teamName: "Industrials & Natural Resources", ticker: "MG", name: "Magna International", amountInShares: 120, costCad: 56.34, industry: "Industrials" },
  { teamName: "Industrials & Natural Resources", ticker: "XYL", name: "Xylem Inc.", amountInShares: 80, costCad: 127.89, industry: "Industrials" },
  { teamName: "Industrials & Natural Resources", ticker: "CP", name: "Canadian Pacific Railway", amountInShares: 75, costCad: 108.67, industry: "Industrials" },
  { teamName: "Industrials & Natural Resources", ticker: "NTR", name: "Nutrien Ltd.", amountInShares: 100, costCad: 52.12, industry: "Materials" },
  { teamName: "Industrials & Natural Resources", ticker: "AMTM", name: "Amentum Holdings", amountInShares: 240, costCad: 23.45, industry: "Industrials" },
  { teamName: "Health Care", ticker: "PFE", name: "Pfizer Inc.", amountInShares: 200, costCad: 26.78, industry: "Healthcare" },
  { teamName: "Health Care", ticker: "VRTX", name: "Vertex Pharmaceuticals", amountInShares: 35, costCad: 472.34, industry: "Healthcare" },
  { teamName: "Health Care", ticker: "NVO", name: "Novo Nordisk A/S", amountInShares: 110, costCad: 103.45, industry: "Healthcare" },
  { teamName: "Fixed Income & Real Estate", ticker: "BAC", name: "Bank of America", amountInShares: 120, costCad: 42.67, industry: "Financial Services" },
  { teamName: "Fixed Income & Real Estate", ticker: "WMT", name: "Walmart Inc.", amountInShares: 65, costCad: 167.89, industry: "Consumer" },
  { teamName: "Fixed Income & Real Estate", ticker: "REI", name: "RingCentral Inc.", amountInShares: 180, costCad: 34.56, industry: "Real Estate" },
  { teamName: "Fixed Income & Real Estate", ticker: "PLD", name: "Prologis Inc.", amountInShares: 95, costCad: 112.34, industry: "Real Estate" },
];

async function run() {
  console.log("Seeding holdings...");

  for (const entry of holdings) {
    const team = await prisma.team.findUnique({
      where: { name: entry.teamName },
      select: { id: true },
    });

    if (!team) {
      console.warn(`Skipping ${entry.ticker}: team not found (${entry.teamName})`);
      continue;
    }

    const existing = await prisma.holding.findFirst({
      where: {
        teamId: team.id,
        ticker: entry.ticker,
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.holding.update({
        where: { id: existing.id },
        data: {
          name: entry.name,
          amountInShares: entry.amountInShares,
          costCad: entry.costCad,
          industry: entry.industry,
          investDate: new Date("2025-09-01"),
          description: null,
        },
      });
      console.log(`Updated ${entry.teamName} / ${entry.ticker}`);
    } else {
      await prisma.holding.create({
        data: {
          teamId: team.id,
          ticker: entry.ticker,
          name: entry.name,
          amountInShares: entry.amountInShares,
          costCad: entry.costCad,
          industry: entry.industry,
          investDate: new Date("2025-09-01"),
          description: null,
        },
      });
      console.log(`Created ${entry.teamName} / ${entry.ticker}`);
    }
  }
}

run()
  .catch((error) => {
    console.error("Error seeding holdings:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
