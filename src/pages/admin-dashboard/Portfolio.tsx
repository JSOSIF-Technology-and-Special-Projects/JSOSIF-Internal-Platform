"use client";

import React, { useState, useEffect } from "react";
import DataTable, { Header } from "@/components/admin-dashboard/DataTable";
import { listHoldings } from "@/lib/queries/holdings/listHoldings";
import createHolding from "@/lib/mutations/holdings/createHolding";
import CreateModel, {
  CreateField,
} from "@/components/admin-dashboard/CreateModel";

export default function Portfolio() {
  const [data, setData] = useState<any>(["empty"]);
  useEffect(() => {
    listHoldings()
      .then((res) => {
        if (res.error) return console.error(res.error);
        setData(res.data);
        console.log(res);
      })
      .catch((err) => console.error(err));
  }, []);

  const createFields: CreateField[] = [
    { key: "ticker", label: "Ticker*", type: "text" },
    { key: "name", label: "Company Name*", type: "text" },
    { key: "description", label: "Description", type: "text" },
    { key: "investDate", label: "Investment Date*", type: "date" },
    { key: "divestDate", label: "Divest Date", type: "date" },
    { key: "amountInShares", label: "Amount in Shares*", type: "number" },
    { key: "costCad", label: "Cost (CAD)*", type: "number" },
    { key: "industry", label: "Industry", type: "text" },
    { key: "teamId", label: "Team ID*", type: "text" },
  ];

  const headers: Header[] = [
    { key: "ticker", label: "Ticker", isNameKey: true },
    { key: "name", label: "Company Name" },
    {
      key: "team",
      label: "Team",
      resolver(row) {
        return row.team?.name || "No Team";
      },
    },
    { key: "industry", label: "Industry" },
    { key: "amountInShares", label: "Shares" },
    { key: "costCad", label: "Cost (CAD)" },
    {
      key: "investDate",
      label: "Investment Date",
      resolver(row) {
        return row.investDate
          ? new Date(row.investDate).toLocaleDateString()
          : "N/A";
      },
    },
    {
      key: "divestDate",
      label: "Divest Date",
      resolver(row) {
        return row.divestDate
          ? new Date(row.divestDate).toLocaleDateString()
          : "N/A";
      },
    },
  ];

  const [createModelOpen, setCreateModelOpen] = useState<boolean>(false);
  function toggleCreateModel() {
    setCreateModelOpen((prev) => !prev);
  }

  function refreshData() {
    listHoldings()
      .then((res) => {
        if (res.error) return console.error(res.error);
        setData(res.data);
        console.log(res);
      })
      .catch((err) => console.error(err));
  }

  return (
    <>
      <CreateModel
        modelName="Holding"
        createFields={createFields}
        createMutation={createHolding}
        toggleModel={toggleCreateModel}
        afterCreate={refreshData}
        modelOpen={createModelOpen}
      />
      <div className="w-full h-full p-10">
        <h1 className="text-4xl font-medium mb-6">Portfolio Holdings</h1>
        <DataTable
          initialData={data}
          onCreateClick={toggleCreateModel}
          headers={headers}
          modelName="Holding"
          idKey="id"
          description="A list of all portfolio holdings and their respective information."
        />
      </div>
    </>
  );
}
