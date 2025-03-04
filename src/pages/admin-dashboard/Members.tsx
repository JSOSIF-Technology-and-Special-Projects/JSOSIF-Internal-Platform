import React from "react";
import DataTable, { Header } from "@/components/admin-dashboard/DataTable";
import { mockApiData } from "@/data/mockApi";

export default function Members() {
	// const data = mockApiData.members;

	return (
		<div className="w-full h-full p-10">
			<h1 className="text-4xl font-medium mb-6">Members</h1>
		</div>
	);
}
