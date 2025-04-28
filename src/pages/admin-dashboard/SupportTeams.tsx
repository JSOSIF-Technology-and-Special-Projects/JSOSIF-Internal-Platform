"use client";
import React, { useState, useEffect } from "react";
import DataTable, { Header } from "@/components/admin-dashboard/DataTable";
import { mockApiData } from "@/data/mockApi";
import createSupportTeam from "@/app/api/mutations/supportTeams/createSupportTeam";
import CreateModel, {
	CreateField,
} from "@/components/admin-dashboard/CreateModel";
import { listSupportTeams } from "@/app/api/queries/supportTeams/listSupportTeams";
import deleteSupportTeam from "@/app/api/mutations/supportTeams/deleteSupportTeam";
import { Args } from "@/utils/interfaces";

export default function SupportTeams() {
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
		listSupportTeams({
			limit: 10,
			offset: 0,
			query: "",
			sortDirection: "DESC",
			sortField: "",
		})
			.then((res) => {
				if (res.error) return console.error(res.error);
				setData(res.data);
				console.log(res);
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

	function refreshData(args: Args) {
		listSupportTeams({ ...currArgs, ...args })
			.then((res) => {
				if (res.error) return console.error(res.error);
				setData(res.data);
				setCount(res.count);
				console.log(res);
			})
			.catch((err) => console.error(err));
	}

	function handleDeleteMutation(rowId: string) {
		deleteSupportTeam({ supportteamid: rowId })
			.then((res) => {
				if (res.error) return console.error(res.error);
				refreshData({
					limit: 10,
					offset: 0,
					query: "",
					sortDirection: "DESC",
					sortField: "",
				});
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
					refreshData={refreshData}
					initialData={data}
					count={count}
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
