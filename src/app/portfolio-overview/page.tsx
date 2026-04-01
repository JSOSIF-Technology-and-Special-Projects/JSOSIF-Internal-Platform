
"use client"
import HoldingsTable from "@/components/admin-dashboard/HoldingsTable";
import PerformanceMetrics from "@/components/admin-dashboard/PerformanceMetrics";
import PortfolioCompositionChart from "@/components/admin-dashboard/PortfolioCompositionChart";
import { useEffect, useState } from "react";

export default function PortfolioOverview() {
    const [holdings, setHoldings] = useState([]);
    const [totalValue, setTotalValue] = useState(0);
    const [compositionData, setCompositionData] = useState([]);

    useEffect(() => {
        fetch('/api/holdings')
            .then(res => res.json())
            .then(data => {
                setHoldings(data);
                calculateMetrics(data);
            });
    }, []);

    const calculateMetrics = (data) => {
        const total = data.reduce((acc, holding) => acc + holding.marketValue, 0);
        setTotalValue(total);

        const teams = data.reduce((acc, holding) => {
            const team = holding.team || "Unknown";
            if (!acc[team]) {
                acc[team] = 0;
            }
            acc[team] += holding.marketValue;
            return acc;
        }, {});

        const teamArray = Object.entries(teams).map(([name, value]) => ({ name, value }));

        const totalPortfolioValue = teamArray.reduce((acc, team) => acc + team.value, 0);
        
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];

        const compositionData = teamArray.map((team, index) => ({
            name: team.name,
            symbol: team.name,
            percentage: (team.value / totalPortfolioValue) * 100,
            color: COLORS[index % COLORS.length],
        }));

        setCompositionData(compositionData);
    };

    return (
        <div className="container mx-auto p-4 pt-40">
            <h1 className="text-2xl font-bold mb-4">Portfolio Overview</h1>
            <PerformanceMetrics totalValue={totalValue} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Team Composition</h2>
                    <PortfolioCompositionChart data={compositionData} />
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-2">All Holdings</h2>
                    <HoldingsTable holdings={holdings} />
                </div>
            </div>
        </div>
    );
}
