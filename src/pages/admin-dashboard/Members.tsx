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

  return response.json();
}

async function getRoles() {
  const response = await fetch("/api/admin/roles", {
    cache: "no-store",
  });

  return response.json();
}

async function getTeams() {
  const response = await fetch("/api/admin/teams", {
    cache: "no-store",
  });

  return response.json();
}

async function createMember(input: CreateMemberInput) {
  const response = await fetch("/api/admin/members", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return response.json();
}

export default function Members() {
  const [data, setData] = useState<unknown[] | ["empty"]>(["empty"]);
  const [roles, setRoles] = useState<SelectOption[]>([]);
  const [teams, setTeams] = useState<SelectOption[]>([]);

  useEffect(() => {
    getMembers()
      .then((res) => {
        if (res.error) return console.error(res.error);
        setData(res.data);
      })
      .catch((err) => console.error(err));

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
    setCreateModelOpen((prev) => !prev);
  }

  function refreshData() {
    getMembers()
      .then((res) => {
        if (res.error) return console.error(res.error);
        setData(res.data);
      })
      .catch((err) => console.error(err));
  }

  return (
    <>
      <CreateModel
        modelName="Member"
        createFields={createFields}
        createMutation={(input: Partial<CreateMemberInput>) =>
          createMember({
            ...input,
            createUser: Boolean(input.email),
          } as CreateMemberInput)
        }
        toggleModel={toggleCreateModel}
        afterCreate={refreshData}
        modelOpen={createModelOpen}
      />
      <div className="w-full h-full pt-32">
        <h1 className="text-4xl font-medium mb-6">Members</h1>
        <DataTable
          initialData={data}
          onCreateClick={toggleCreateModel}
          headers={headers}
          modelName="Member"
          idKey="id"
          description="A list of all members displayed on the website and their respective information."
        />
      </div>
    </>
  );
}
