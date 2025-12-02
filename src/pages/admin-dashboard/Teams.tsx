"use client";

import React, { useState, useEffect } from "react";
import DataTable, { Header } from "@/components/admin-dashboard/DataTable";
import { mockApiData } from "@/data/mockApi";
import createTeam from "@/lib/mutations/teams/createTeam";
import { listTeams } from "@/lib/queries/teams/listTeams";
import CreateModel, {
  CreateField,
} from "@/components/admin-dashboard/CreateModel";

export default function Teams() {
  const [data, setData] = useState<any>(["empty"]);
  useEffect(() => {
    listTeams()
      .then((res) => {
        if (res.error) return console.error(res.error);
        // Filter to only show Investment teams on the client side for now
        const investmentTeams =
          res.data?.filter((team: any) => team.teamType === "Investment") || [];
        setData(investmentTeams);
        console.log(res);
      })
      .catch((err) => console.error(err));
  }, []);

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

  const [createModelOpen, setCreateModelOpen] = useState<boolean>(false);
  function toggleCreateModel() {
    setCreateModelOpen((prev) => !prev);
  }

  function refreshData() {
    listTeams()
      .then((res) => {
        if (res.error) return console.error(res.error);
        // Filter to only show Investment teams on the client side for now
        const investmentTeams =
          res.data?.filter((team: any) => team.teamType === "Investment") || [];
        setData(investmentTeams);
        console.log(res);
      })
      .catch((err) => console.error(err));
  }

  return (
    <>
      <CreateModel
        modelName="Investment Team"
        createFields={createFields}
        createMutation={(input: any) =>
          createTeam({ ...input, teamType: "Investment" })
        }
        toggleModel={toggleCreateModel}
        afterCreate={refreshData}
        modelOpen={createModelOpen}
      />
      <div className="w-full h-full p-10">
        <h1 className="text-4xl font-medium mb-6">Investment Teams</h1>
        <DataTable
          initialData={data}
          onCreateClick={toggleCreateModel}
          headers={headers}
          modelName="Investment Team"
          idKey="id"
          description="A list of all investment teams displayed on the website."
        />
      </div>
    </>
  );
}
