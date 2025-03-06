"use client";
import React, { useState, useEffect } from "react";
import DataTable, { Header } from "@/components/admin-dashboard/DataTable";
import { mockApiData } from "@/data/mockApi";
import CreateModel, {
	CreateField,
} from "@/components/admin-dashboard/CreateModel";
import { listAlumni } from "@/app/api/queries/alumni/listAlumni";
import createAlumni from "@/app/api/mutations/alumni/createAlumni";

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
		{ key: "firstname", label: "First Name*", type: "text" },
		{ key: "lastname", label: "Last Name*", type: "text" },
		{ key: "position", label: "Company Position", type: "text" },
		{ key: "company", label: "Company", type: "text" },
		{ key: "program", label: "Program*", type: "text" },
		{ key: "yearsonfund", label: "Years*", type: "text" },
		{ key: "image", label: "Image*", type: "text" },
		{ key: "blurb", label: "Blurb", type: "text" },
		{ key: "linkedin", label: "LinkedIn", type: "text" },
	];

	const headers: Header[] = [
		{ key: "firstname", label: "First Name" },
		{ key: "lastname", label: "Last Name" },
		{ key: "position", label: "Company Position" },
		{ key: "company", label: "Company" },
		{
			key: "program",
			label: "Program of Study",
			styles: "max-w-40 w-fit overflow-x-auto",
		},
		{ key: "yearsonfund", label: "Years on Fund" },
		{ key: "image", label: "Image" },
		{ key: "blurb", label: "Blurb" },
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
					idKey="alumniid"
					description="A list of all alumni displayed on the website and their respective information."
				/>
			</div>
		</>
	);
}
