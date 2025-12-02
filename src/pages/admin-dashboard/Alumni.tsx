"use client";
import React, { useState, useEffect } from "react";
import DataTable, { Header } from "@/components/admin-dashboard/DataTable";
import { mockApiData } from "@/data/mockApi";
import CreateModel, {
  CreateField,
} from "@/components/admin-dashboard/CreateModel";
import { listAlumni } from "@/lib/queries/alumni/listAlumni";
import createAlumni from "@/lib/mutations/alumni/createAlumni";

export default function Alumni() {
  const [data, setData] = useState<any>(["empty"]);
  useEffect(() => {
    listAlumni()
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

  const [createModelOpen, setCreateModelOpen] = useState<boolean>(false);
  function toggleCreateModel() {
    setCreateModelOpen((prev) => !prev);
  }

  function refreshData() {
    listAlumni()
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
        modelName="Alumni"
        createFields={createFields}
        createMutation={createAlumni}
        toggleModel={toggleCreateModel}
        afterCreate={refreshData}
        modelOpen={createModelOpen}
      />
      <div className="w-full h-full p-10">
        <h1 className="text-4xl font-medium mb-6">Alumni</h1>
        <DataTable
          initialData={data}
          onCreateClick={toggleCreateModel}
          headers={headers}
          modelName="Alumni"
          idKey="id"
          description="A list of all alumni displayed on the website and their respective information."
        />
      </div>
    </>
  );
}
