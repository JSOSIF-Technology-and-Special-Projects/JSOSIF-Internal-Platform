"use client";

import React, { useState, useEffect, useRef } from "react";
import DataTable, { Header } from "@/components/admin-dashboard/DataTable";
import CreateModel, { CreateField } from "@/components/admin-dashboard/CreateModel";

async function getTeams() {
  const response = await fetch("/api/admin/teams", { cache: "no-store" });
  const result = await response.json();
  if (!response.ok || result.error) throw new Error(result.message || result.error || "Unable to load records");
  return result;
}

export default function Teams() {
  const [data, setData] = useState<any[]>(["empty"]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingRow, setEditingRow] = useState<any>(null);
  const [createModelOpen, setCreateModelOpen] = useState(false);
  const deleting = useRef(false);

  async function refreshData() {
    try {
      const result = await getTeams();
      setData(result.data.filter((team: any) => team.teamType === "Investment"));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load records");
      setData((previous) => previous[0] === "empty" ? [] : previous);
    }
  }

  useEffect(() => { void refreshData(); }, []);

  function toggleCreateModel() {
    setCreateModelOpen(false);
    setEditingRow(null);
  }

  async function saveInvestmentTeam(input: Record<string, unknown>) {
    setSuccess("");
    const response = await fetch(editingRow
      ? `/api/admin/teams/${encodeURIComponent(editingRow.id)}`
      : "/api/admin/teams", {
      method: editingRow ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingRow ? input : { ...input, teamType: "Investment" }),
    });
    const result = await response.json();
    if (!response.ok || result.error) throw new Error(result.message ? `${result.message}: ${result.error || "Save failed"}` : result.error || "Save failed");
    setSuccess(editingRow ? "Investment team updated successfully." : "Investment team created successfully.");
    return result;
  }

  async function onDelete(id: string | number) {
    if (deleting.current || !window.confirm("Delete this investment team?")) return;
    deleting.current = true;
    setSuccess("");
    try {
      const response = await fetch(`/api/admin/teams/${encodeURIComponent(id)}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok || result.error) throw new Error(result.message || result.error || "Delete failed");
      setSuccess("Investment team deleted successfully.");
      setData((previous) => previous.filter((row) => row.id !== id));
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      deleting.current = false;
    }
  }

  const createFields: CreateField[] = [
    { key: "name", label: "Name*", type: "text" },
    { key: "description", label: "Description", type: "text" },
  ];

  const headers: Header[] = [
    { key: "name", label: "Name", isNameKey: true },
    { key: "description", label: "Description" },
    {
      key: "members",
      label: "Members Count",
      resolver(row) {
        return row.members?.length || 0;
      },
    },
    {
      key: "holdings",
      label: "Holdings Count",
      resolver(row) {
        return row.holdings?.length || 0;
      },
    },
  ];

  const formFields = createFields.map((field) => ({
    ...field,
    value: editingRow
      ? field.type === "date" ? editingRow[field.key]?.slice(0, 10) : editingRow[field.key]
      : field.value,
  }));

  return (
    <>
      {createModelOpen && <CreateModel
        mode={editingRow ? "edit" : "create"}
        modelName="Investment Team"
        createFields={formFields}
        createMutation={saveInvestmentTeam}
        toggleModel={toggleCreateModel}
        afterCreate={refreshData}
        modelOpen={createModelOpen}
      />}
      <div className="w-full h-full p-10">
        <h1 className="text-4xl font-medium mb-6">Investment Teams</h1>
        {success && (
          <div role="status" className="mb-4 flex items-center justify-between gap-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-800">
            <span>{success}</span>
            <button type="button" aria-label="Dismiss success message" className="shrink-0 underline" onClick={() => setSuccess("")}>Dismiss</button>
          </div>
        )}
        {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
        <DataTable
          initialData={data}
          onCreateClick={() => { setEditingRow(null); setCreateModelOpen(true); }}
          onEdit={(row) => { setEditingRow(row); setCreateModelOpen(true); }}
          onDelete={onDelete}
          headers={headers}
          modelName="Investment Team"
          idKey="id"
          description="A list of all investment teams displayed on the website."
          enablePagination={true}
          rowsPerPage={8}
          fillEmptyRows={true}
          allowRowsPerPageInput={true}
        />
      </div>
    </>
  );
}
