"use client";

import React, { useState, useEffect } from "react";

import DataTable, { Header } from "@/components/admin-dashboard/DataTable";
import dynamic from "next/dynamic";
const SymbolOverviewWidget = dynamic(
  () => import("@/components/admin-dashboard/SymbolOverviewWidget"), // adjust path
  { ssr: false }
);
import CreateModel, {
	CreateField,
} from "@/components/admin-dashboard/CreateModel";

type Team = {
	id: string;
	name: string;
};

export default function Portfolios() {

  const [data, setData] = useState<any>(["empty"]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
		async function loadTeams() {
			try {
				const res = await fetch("/api/teams", { method: "GET" });
				if (!res.ok) {
					console.error("Failed to fetch teams", res.status);
					return;
				}
				const data = await res.json();
				setTeams(data);
			} catch (err) {
				console.error("Error loading teams", err);
			}
		}

		loadTeams();
	}, []);

  const loadHoldings = React.useCallback(async () => {
    try {
      const res = await fetch("/api/holdings", { method: "GET" });
      if (!res.ok) {
        console.error("Failed to fetch holdings", res.status);
        return;
      }
      const data = await res.json();
      setData(data);
    } catch (err) {
      console.error("Error loading holdings", err);
    }
  }, []);

  useEffect(() => {
    loadHoldings();
  }, [loadHoldings]);

  function refreshData() {
    loadHoldings();
  }

  async function onDelete(id: string | number, e: React.MouseEvent<HTMLButtonElement> | undefined) {
	const content = JSON.stringify(id);

	setData(["empty"] as any);
	if (e) {

	}

    const res = await fetch("/api/holdings", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: content,
    });

    if (!res.ok) {
      console.error("Failed to delete holding", res.status);
      return;
    }

	loadHoldings();
  }

  async function createHolding(body: any) {
    const content = JSON.stringify(body);

    const res = await fetch("/api/holdings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: content,
    });

    if (!res.ok) {
      console.error("Failed to create holding", res.status);
      return;
    }

  }

	const createFields: CreateField[] = [
		{ key: "name", label: "Name", type: "text" },
		{ key: "teamId", label: "Team", type: "select", extraArgs: teams},
		{ key: "ticker", label: "Ticker", type: "text"},
		{ key: "description", label: "Description", type: "text"},
		{ key: "amountInShares", label: "Amount In Shares", type: "number"},
		{ key: "costCad", label: "Cost Per Share (CAD)", type: "number"},
		{ key: "industry", label: "Industry", type: "text"},
		{ key: "investDate", label: "Invest Date", type: "date"}
	];

	const headers: Header[] = [
		{ key: "name", label: "Name", isNameKey: true },
		{ key: "team", label: "Team"},
		{ key: "ticker", label: "Ticker"},
		{ key: "description", label: "Description"},
		{ key: "amountInShares", label: "Amount In Shares", },
		{ key: "costCad", label: "Cost Per Share (CAD)", },
		{ key: "industry", label: "Industry", },
		{ key: "investDate", label: "Invest Date"}
	];

	

	const [createModelOpen, setCreateModelOpen] = useState<boolean>(false);
	function toggleCreateModel() {
		setCreateModelOpen((prev) => !prev);
	}

	const tickers = data.map((h: any) => {return h.ticker}).join(",");
	  

	const pg = <>
			<CreateModel
				modelName="Holding"
				createFields={createFields}
				createMutation={createHolding}
				toggleModel={toggleCreateModel}
				afterCreate={refreshData}
				modelOpen={createModelOpen}
			/>
			<div className="w-full h-full p-10 flex flex-col gap-4">
				<div className="flex flex-row justify-between">
					<h1 className="text-4xl font-medium mb-6">Portfolio</h1>
				</div>
					
					<DataTable 
						initialData={data}
						onCreateClick={toggleCreateModel}
						headers={headers}
						modelName="Holding"
						idKey="id"
						description="A list of every holding from each team. "
						onDelete={onDelete}
					/>

					<div className="">
						<SymbolOverviewWidget ticker={tickers}/> 
					</div>
			</div>
		</>;

	return pg	
}
