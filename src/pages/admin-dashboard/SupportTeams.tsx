"use client";
import React, { useState, useEffect } from "react";
import DataTable, { Header } from "@/components/admin-dashboard/DataTable";
import CreateModel, {
  CreateField,
} from "@/components/admin-dashboard/CreateModel";

async function getSupportTeams() {
  const response = await fetch("/api/admin/support-teams", {
    cache: "no-store",
  });

  return response.json();
}

async function createSupportTeam(input: Record<string, unknown>) {
  const response = await fetch("/api/admin/support-teams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return response.json();
}

export default function SupportTeams() {
  const [data, setData] = useState<any>(["empty"]);
  useEffect(() => {
    getSupportTeams()
      .then((res) => {
        if (res.error) return console.error(res.error);
        setData(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const createFields: CreateField[] = [
    { key: "name", label: "Name", type: "text" },
    { key: "description", label: "Description", type: "text" },
  ];

  const headers: Header[] = [
    { key: "name", label: "Name", isNameKey: true },
    { key: "description", label: "Description" },
  ];

  const [createModelOpen, setCreateModelOpen] = useState<boolean>(false);
  function toggleCreateModel() {
    setCreateModelOpen((prev) => !prev);
  }

  function refreshData() {
    getSupportTeams()
      .then((res) => {
        if (res.error) return console.error(res.error);
        setData(res.data);
      })
      .catch((err) => console.error(err));
  }

  return (
    <>
      <CreateModel
        modelName="Support Team"
        createFields={createFields}
        createMutation={createSupportTeam}
        toggleModel={toggleCreateModel}
        modelOpen={createModelOpen}
        afterCreate={refreshData}
      />
      <div className="w-full h-full p-10">
        <h1 className="text-4xl font-medium mb-6">Support Teams</h1>
        <DataTable
          initialData={data}
          onCreateClick={toggleCreateModel}
          headers={headers}
          modelName="Support Team"
          idKey="supportteamid"
          description="A list of all support teams and their respective descriptions."
        />
      </div>
    </>
  );
}
