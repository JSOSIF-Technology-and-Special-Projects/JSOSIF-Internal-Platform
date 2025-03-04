import React from "react";
import DataTable, { Header } from "@/components/admin-dashboard/DataTable";
import { mockApiData } from "@/data/mockApi";

export default function Teams() {
	const data = mockApiData.teams;

	const headers: Header[] = [
		{ key: "name", label: "Name", isNameKey: true },
		{ key: "banner", label: "Banner" },
	];

	return (
		<div className="w-full h-full p-10">
			<h1 className="text-4xl font-medium mb-6">Teams</h1>
			<DataTable
				initialData={data}
				headers={headers}
				modelName="Team"
				description="A list of all teams displayed on the website and their respective banners."
			/>
		</div>
	);
}
