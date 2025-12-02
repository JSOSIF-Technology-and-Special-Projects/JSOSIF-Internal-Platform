"use client";

import React, { useState, useEffect } from "react";
import DataTable, { Header } from "@/components/admin-dashboard/DataTable";
import { mockApiData } from "@/data/mockApi";
import { listMembers } from "@/lib/queries/members/listMembers";
import CreateModel, {
  CreateField,
} from "@/components/admin-dashboard/CreateModel";
import createMember from "@/lib/mutations/members/createMember";

export default function Members() {
  const [data, setData] = useState<any>(["empty"]);
  useEffect(() => {
    listMembers()
      .then((res) => {
        if (res.error) return console.error(res.error);
        setData(res.data);
        console.log(res);
      })
      .catch((err) => console.error(err));
  }, []);

  const createFields: CreateField[] = [
    { key: "name", label: "Full Name*", type: "text" },
    { key: "description", label: "Description", type: "text" },
    { key: "program", label: "Program*", type: "text" },
    { key: "year", label: "Year of Study*", type: "number" },
    { key: "memberSince", label: "Member Since*", type: "date" },
    { key: "linkedin", label: "LinkedIn", type: "text" },
    { key: "roleId", label: "Role ID", type: "text" },
    { key: "teamId", label: "Team ID", type: "text" },
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
    listMembers()
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
        modelName="Member"
        createFields={createFields}
        createMutation={createMember}
        toggleModel={toggleCreateModel}
        afterCreate={refreshData}
        modelOpen={createModelOpen}
      />
      <div className="w-full h-full p-10">
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
