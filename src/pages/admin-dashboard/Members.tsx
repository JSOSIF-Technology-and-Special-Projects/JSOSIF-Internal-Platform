"use client";

import React, { useState, useEffect } from "react";
import DataTable, { Header } from "@/components/admin-dashboard/DataTable";
import CreateModel, {
  CreateField,
} from "@/components/admin-dashboard/CreateModel";

interface CreateMemberInput {
  name: string;
  description?: string;
  program: string;
  year: number;
  memberSince: string | Date;
  linkedin?: string;
  roleId?: string;
  teamId?: string;
  email?: string;
  password?: string;
  createUser?: boolean;
}

interface SelectOption {
  id: string;
  name: string;
}

async function getMembers() {
  const response = await fetch("/api/admin/members", {
    cache: "no-store",
  });

  const result = await response.json();
  if (!response.ok || result.error) {
    throw new Error(result.message ? `${result.message}: ${result.error}` : result.error || "Request failed");
  }
  return result;
}

async function getRoles() {
  const response = await fetch("/api/admin/roles", {
    cache: "no-store",
  });

  const result = await response.json();
  if (!response.ok || result.error) {
    throw new Error(result.message ? `${result.message}: ${result.error}` : result.error || "Request failed");
  }
  return result;
}

async function getTeams() {
  const response = await fetch("/api/admin/teams", {
    cache: "no-store",
  });

  const result = await response.json();
  if (!response.ok || result.error) {
    throw new Error(result.message ? `${result.message}: ${result.error}` : result.error || "Request failed");
  }
  return result;
}

async function createMember(input: CreateMemberInput) {
  const response = await fetch("/api/admin/members", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const result = await response.json();
  if (!response.ok || result.error) {
    throw new Error(result.message ? `${result.message}: ${result.error}` : result.error || "Request failed");
  }
  return result;
}

export default function Members() {
  const [editingMember, setEditingMember] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [data, setData] = useState<unknown[] | ["empty"]>(["empty"]);
  const [roles, setRoles] = useState<SelectOption[]>([]);
  const [teams, setTeams] = useState<SelectOption[]>([]);

  useEffect(() => {
    getMembers()
      .then((res) => {
        if (res.error) return console.error(res.error);
        setData(res.data);
      })
      .catch((err) => { setError(err.message); setData([]); });

    getRoles()
      .then((res) => {
        if (res.error) return console.error(res.error);
        setRoles((res.data ?? []).map((r: SelectOption) => ({ id: r.id, name: r.name })));
      })
      .catch((err) => console.error(err));

    getTeams()
      .then((res) => {
        if (res.error) return console.error(res.error);
        setTeams((res.data ?? []).map((t: SelectOption) => ({ id: t.id, name: t.name })));
      })
      .catch((err) => console.error(err));
  }, []);

  const createFields: CreateField[] = [
    { key: "name", label: "Full Name*", type: "text" },
    { key: "description", label: "Description", type: "text" },
    { key: "program", label: "Program*", type: "text" },
    { key: "year", label: "Year of Study*", type: "number" },
    { key: "memberSince", label: "Member Since*", type: "date" },
    { key: "email", label: "Email (creates auth user)", type: "text" },
    { key: "password", label: "Temp Password (optional)", type: "text" },
    { key: "linkedin", label: "LinkedIn", type: "text" },
    { key: "roleId", label: "Role", type: "select", extraArgs: roles },
    { key: "teamId", label: "Team", type: "select", extraArgs: teams },
  ];

  const headers: Header[] = [
    { key: "name", label: "Name", isNameKey: true },
    {
      key: "role",
      label: "Role",
      resolver(row) {
        return row.role?.name || "No Role";
      },
    },
    {
      key: "team",
      label: "Team",
      resolver(row) {
        return row.team?.name || "No Team";
      },
    },
    {
      key: "program",
      label: "Program",
      styles: "max-w-40 w-fit overflow-x-auto",
    },
    { key: "year", label: "Year" },
    {
      key: "memberSince",
      label: "Member Since",
      resolver(row) {
        return row.memberSince
          ? new Date(row.memberSince).toLocaleDateString()
          : "N/A";
      },
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      styles: "max-w-60 overflow-x-auto",
    },
  ];

  const [createModelOpen, setCreateModelOpen] = useState<boolean>(false);
  function toggleCreateModel() {
    setCreateModelOpen(false);
    setEditingMember(null);
  }

  async function deleteRow(id: string | number) {
    if (deleting || !window.confirm("Delete this member?")) return;
    setDeleting(true);
    setSuccess("");
    setError("");
    try {
      const response = await fetch(`/api/admin/members/${encodeURIComponent(id)}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok || result.error) throw new Error(result.message || result.error || "Delete failed");
      setSuccess("Member deleted successfully.");
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  async function refreshData() {
    const res = await getMembers();
    setData(res.data);
    setError("");
  }

  const formFields = editingMember
    ? createFields.filter((field) => !["email", "password"].includes(field.key)).map((field) => ({
        ...field,
        value: field.key === "memberSince" ? editingMember.memberSince?.slice(0, 10) : editingMember[field.key],
      }))
    : createFields;

  return (
    <>
      {createModelOpen && <CreateModel
        mode={editingMember ? "edit" : "create"}
        modelName="Member"
        createFields={formFields}
        createMutation={async (input: Partial<CreateMemberInput>) => {
          setSuccess("");
          if (!editingMember) {
            const result = await createMember({ ...input, createUser: Boolean(input.email) } as CreateMemberInput);
            setSuccess("Member created successfully.");
            return result;
          }
          const response = await fetch(`/api/admin/members/${encodeURIComponent(editingMember.id)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          });
          const result = await response.json();
          if (!response.ok || result.error) throw new Error(result.message || result.error || "Update failed");
          setSuccess("Member updated successfully.");
          return result;
        }}
        toggleModel={toggleCreateModel}
        afterCreate={refreshData}
        modelOpen={createModelOpen}
      />}
      <div className="w-full h-full p-10">
        <h1 className="text-4xl font-medium mb-6">Members</h1>
        {success && (
          <div role="status" className="mb-4 flex items-center justify-between gap-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-800">
            <span>{success}</span>
            <button type="button" aria-label="Dismiss success message" className="shrink-0 underline" onClick={() => setSuccess("")}>Dismiss</button>
          </div>
        )}
        {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
        <DataTable
          initialData={data}
          onCreateClick={() => { setEditingMember(null); setCreateModelOpen(true); }}
          onEdit={(row) => { setEditingMember(row); setCreateModelOpen(true); }}
          onDelete={deleteRow}
          headers={headers}
          modelName="Member"
          idKey="id"
          description="A list of all members displayed on the website and their respective information."
          enablePagination={true}
          rowsPerPage={8}
          allowRowsPerPageInput={true}
        />
      </div>
    </>
  );
}
