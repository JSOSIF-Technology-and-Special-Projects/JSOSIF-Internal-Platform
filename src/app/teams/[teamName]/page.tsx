import { mockApiData } from "@/data/mockApi";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SymbolOverviewWidget from "@/components/admin-dashboard/SymbolOverviewWidget";
import PortfolioCompositionChart from "@/components/admin-dashboard/PortfolioCompositionChart";
import HoldingsTable from "@/components/admin-dashboard/HoldingsTable";
import PerformanceMetrics from "@/components/admin-dashboard/PerformanceMetrics";

interface PortfolioComposition {
  symbol: string;
  name: string;
  percentage: number;
  color: string;
}

interface Holding {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface BondTicker {
  s: string;
  d: string;
}

import type { StaticImageData } from "next/image";

interface TeamData {
  slug: string;
  name: string;
  description: string;
  tickers: string;
  value: number;
  return: number;
  sp500Return: number;
  portfolioComposition: PortfolioComposition[];
  holdings: Holding[];
  bgImage: string | StaticImageData;
  bondTicker?: BondTicker[];
}

export default function TeamPage({ params }: { params: { teamName: string } }) {
  const teamName = params.teamName;
  const teamData = mockApiData.investmentDivisions.find(
    (division) => division.slug === teamName
  ) as TeamData;

  if (!teamData) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">Team Not Found</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          Go back to homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-[9rem]">
      {/* Header with Background Image */}
      <div className="mb-8 relative">
        <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-6">
          <Image
            src={teamData.bgImage}
            alt={`${teamData.name} background`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{teamData.name}</h1>
          </div>
        </div>
        <p className="text-gray-600 max-w-4xl">{teamData.description}</p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <PerformanceMetrics 
        title="Value"
        value={`$${teamData.value.toLocaleString()}`}
        className="bg-white"
      />
      <PerformanceMetrics 
        title="Return"
        value={`+${teamData.return}%`}
        className="bg-white text-green-600"
      />
      <PerformanceMetrics 
        title="S&P 500"
        value={`${teamData.sp500Return}%`}
        className="bg-white text-red-600"
      />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Portfolio Composition */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Portfolio Composition</h2>
        <PortfolioCompositionChart data={teamData.portfolioComposition} />
        </div>
      </div>

      {/* Chart */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Chart & Price</h2>
          <SymbolOverviewWidget ticker={teamData.tickers} />
        </div>
      </div>

      {/* Holdings Table */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Holdings</h2>
        <HoldingsTable holdings={teamData.holdings} />
        </div>
      </div>
      </div>
    </div>
  );
}
