"use client";

import React, { useState, useEffect, useRef } from "react";
import DataTable, { Header } from "@/components/admin-dashboard/DataTable";
import CreateModel, { CreateField } from "@/components/admin-dashboard/CreateModel";

async function getAlumni() {
  const response = await fetch("/api/admin/alumni", { cache: "no-store" });
  const result = await response.json();
  if (!response.ok || result.error) throw new Error(result.message || result.error || "Unable to load records");
  return result;
}

export default function Alumni() {
  const [data, setData] = useState<any[]>(["empty"]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingRow, setEditingRow] = useState<any>(null);
  const [createModelOpen, setCreateModelOpen] = useState(false);
  const deleting = useRef(false);

  async function refreshData() {
    try {
      const result = await getAlumni();
      setData(result.data);
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

  async function saveAlumni(input: Record<string, unknown>) {
    setSuccess("");
    const response = await fetch(editingRow
      ? `/api/admin/alumni/${encodeURIComponent(editingRow.id)}`
      : "/api/admin/alumni", {
      method: editingRow ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const result = await response.json();
    if (!response.ok || result.error) throw new Error(result.message ? `${result.message}: ${result.error || "Save failed"}` : result.error || "Save failed");
    setSuccess(editingRow ? "Alumni record updated successfully." : "Alumni record created successfully.");
    return result;
  }

  async function onDelete(id: string | number) {
    if (deleting.current || !window.confirm("Delete this alumni?")) return;
    deleting.current = true;
    setSuccess("");
    try {
      const response = await fetch(`/api/admin/alumni/${encodeURIComponent(id)}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok || result.error) throw new Error(result.message || result.error || "Delete failed");
      setSuccess("Alumni record deleted successfully.");
      setData((previous) => previous.filter((row) => row.id !== id));
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      deleting.current = false;
    }
  }

  const createFields: CreateField[] = [
    { key: "name", label: "Full Name*", type: "text" },
    { key: "description", label: "Description", type: "text" },
    { key: "companyName", label: "Company*", type: "text" },
    { key: "industry", label: "Industry*", type: "text" },
    { key: "degree", label: "Degree*", type: "text" },
    { key: "yearsOnFund", label: "Years on Fund*", type: "number" },
    { key: "linkedin", label: "LinkedIn", type: "text" },
    { key: "formerMemberId", label: "Former Member ID", type: "text" },
  ];

  const headers: Header[] = [
    { key: "name", label: "Name", isNameKey: true },
    { key: "companyName", label: "Company" },
    { key: "industry", label: "Industry" },
    { key: "degree", label: "Degree" },
    { key: "yearsOnFund", label: "Years on Fund" },
    {
      key: "description",
      label: "Description",
      styles: "max-w-40 w-fit overflow-x-auto",
    },
    {
      key: "formerMember",
      label: "Former Member",
      resolver(row) {
        return row.formerMember?.name || "N/A";
      },
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      styles: "max-w-60 overflow-x-auto",
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
        modelName="Alumni"
        createFields={formFields}
        createMutation={saveAlumni}
        toggleModel={toggleCreateModel}
        afterCreate={refreshData}
        modelOpen={createModelOpen}
      />}
      <div className="w-full h-full p-10">
        <h1 className="text-4xl font-medium mb-6">Alumni</h1>
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
          modelName="Alumni"
          idKey="id"
          description="A list of all alumni displayed on the website and their respective information."
        />
      </div>
    </>
  );
}
