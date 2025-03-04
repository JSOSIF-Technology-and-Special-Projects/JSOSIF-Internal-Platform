import React from "react";
import DataTable, { Header } from "@/components/admin-dashboard/DataTable";
import { mockApiData } from "@/data/mockApi";

export default function InvestmentDivisions() {
	const data = mockApiData.investmentDivisions;

	const headers: Header[] = [
		{ key: "name", label: "Name", isNameKey: true },
		{ key: "description", label: "Description" },
	];

	return (
		<div className="w-full h-full p-10">
			<h1 className="text-4xl font-medium mb-6">Investment Divisions</h1>
			<DataTable
				initialData={data}
				headers={headers}
				modelName="Investment Division"
			/>
		</div>
	);
}
