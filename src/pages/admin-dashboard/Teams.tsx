"use client";

import React, { useState, useEffect } from "react";
import DataTable, { Header } from "@/components/admin-dashboard/DataTable";
import { mockApiData } from "@/data/mockApi";
import createTeam from "@/app/api/mutations/teams/createTeam";
import { listTeams } from "@/app/api/queries/teams/listTeams";
import CreateModel, {
	CreateField,
} from "@/components/admin-dashboard/CreateModel";
import deleteTeam from "@/app/api/mutations/teams/deleteTeam";
import { Args } from "../../utils/interfaces";

export default function Teams() {
	const [data, setData] = useState<any>(["empty"]);
	const [count, setCount] = useState<number>(0);
	const [currArgs, setCurrArgs] = useState<Args>({
		limit: 10,
		offset: 0,
		query: "",
		sortDirection: "DESC",
		sortField: "",
	});

	useEffect(() => {
		listTeams({
			limit: 10,
			offset: 0,
			query: "",
			sortDirection: "DESC",
			sortField: "",
		})
			.then((res) => {
				if (res.error) return console.error(res.error);
				setData(res.data);
				setCount(res.count);
				console.log(res);
			})
			.catch((err) => console.error(err));
	}, []);

	const createFields: CreateField[] = [
		{ key: "name", label: "Name", type: "text" },
		{ key: "banner", label: "Banner", type: "text" },
	];

	const headers: Header[] = [
		{ key: "name", label: "Name", isNameKey: true },
		{ key: "banner", label: "Banner" },
	];

	const [createModelOpen, setCreateModelOpen] = useState<boolean>(false);
	function toggleCreateModel() {
		setCreateModelOpen((prev) => !prev);
	}

	function refreshData(args: Args = {}) {
		setCurrArgs({ ...currArgs, ...args });
		listTeams({ ...args }) // add args
			.then((res) => {
				if (res.error) return console.error(res.error);
				setData(res.data);
				setCount(res.count);
				console.log(res);
			})
			.catch((err) => console.error(err));
	}

	function handleDeleteMutation(rowId: string) {
		deleteTeam({ teamid: rowId })
			.then((res) => {
				if (res.error) return console.error(res.error);
				refreshData();
			})
			.catch((err) => console.error(err));
	}

	return (
		<>
			<CreateModel
				modelName="Team"
				createFields={createFields}
				createMutation={createTeam}
				toggleModel={toggleCreateModel}
				afterCreate={() => refreshData(currArgs)}
				modelOpen={createModelOpen}
			/>
			<div className="w-full h-full p-10">
				<h1 className="text-4xl font-medium mb-6">Teams</h1>
				<DataTable
					initialData={data}
					onCreateClick={toggleCreateModel}
					deleteHandler={handleDeleteMutation}
					refreshData={refreshData}
					count={count}
					headers={headers}
					modelName="Team"
					idKey="teamid"
					description="A list of all teams displayed on the website and their respective banners."
				/>
			</div>
		</>
	);
}
