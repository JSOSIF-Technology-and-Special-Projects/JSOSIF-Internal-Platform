"use client";

import React, { useState, useEffect } from "react";
import DataTable, { Header } from "@/components/admin-dashboard/DataTable";
import { mockApiData } from "@/data/mockApi";
import { listMembers } from "@/app/api/queries/members/listMembers";
import CreateModel, {
	CreateField,
} from "@/components/admin-dashboard/CreateModel";
import createMember from "@/app/api/mutations/members/createMember";
import deleteMember from "@/app/api/mutations/members/deleteMember";
import { listTeams } from "@/app/api/queries/teams/listTeams";

export default function Members() {
	const [data, setData] = useState<any>(["empty"]);
	const [teamsData, setTeamsData] = useState<any>(["empty"]);
	useEffect(() => {
		listMembers()
			.then((res) => {
				if (res.error) return console.error(res.error);
				setData(res.data);
			})
			.catch((err) => console.error(err));
		listTeams({})
			.then((res) => {
				if (res.error) return console.error(res.error);
				setTeamsData(res.data);
			})
			.catch((err) => console.error(err));
	}, []);

	const createFields: CreateField[] = [
		{ key: "firstname", label: "First Name", type: "text" },
		{ key: "lastname", label: "Last Name", type: "text" },
		{ key: "role", label: "Role", type: "text" },
		{ key: "program", label: "Program", type: "text" },
		{ key: "year", label: "Year of Study", type: "text" },
		{ key: "joined", label: "Join Date", type: "date" }, // TODO: Add date picker
		{ key: "image", label: "Image", type: "text" },
		{ key: "linkedin", label: "LinkedIn", type: "text" },
		{
			key: "teamid",
			label: "Team",
			type: "select",
			selectOptions: teamsData,
			selectLabelKey: "name",
			selectValueKey: "teamid",
		},
	];

	const headers: Header[] = [
		{
			key: "name",
			label: "Name",
			resolver(row) {
				return `${row.firstname} ${row.lastname}`;
			},
			isNameKey: true,
		},
		{ key: "role", label: "Role" },
		{
			key: "program",
			label: "Program",
			styles: "max-w-40 w-fit overflow-x-auto",
		},
		{ key: "year", label: "Year" },
		{
			key: "joined",
			label: "Join Date",
			resolver: (row) => {
				if (row.joined)
					return new Date(row.joined).toISOString().split("T")[0];
				else return "";
			},
			styles: "text-nowrap",
		},
		{ key: "image", label: "Image" },
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

	function handleDeleteMutation(rowId: string) {
		deleteMember({ memberid: rowId })
			.then((res) => {
				if (res.error) return console.error(res.error);
				refreshData();
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
					deleteHandler={handleDeleteMutation}
					headers={headers}
					modelName="Member"
					idKey="memberid"
					description="A list of all members displayed on the website and their respective information."
				/>
			</div>
		</>
	);
}
