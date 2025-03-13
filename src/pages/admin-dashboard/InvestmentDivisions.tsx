"use client";
import React, { useState, useEffect } from "react";
import DataTable, { Header } from "@/components/admin-dashboard/DataTable";
import { mockApiData } from "@/data/mockApi";
import createInvestmentDivision from "@/app/api/mutations/investmentDivisions/createInvestmentDivision";
import CreateModel, {
	CreateField,
} from "@/components/admin-dashboard/CreateModel";
import { listInvestmentDivisions } from "@/app/api/queries/investmentDivisions/listInvestmentDivisions";
import deleteInvestmentDivision from "@/app/api/mutations/investmentDivisions/deleteInvestmentDivision";

export default function InvestmentDivisions() {
	const [data, setData] = useState<any>(["empty"]);
	useEffect(() => {
		listInvestmentDivisions()
			.then((res) => {
				if (res.error) return console.error(res.error);
				setData(res.data);
				console.log(res);
			})
			.catch((err) => console.error(err));
	}, []);

	const headers: Header[] = [
		{ key: "name", label: "Name", isNameKey: true },
		{ key: "description", label: "Description" },
		{ key: "bgimage", label: "Background Image" },
	];

	const createFields: CreateField[] = [
		{ key: "name", label: "Name", type: "text" },
		{ key: "description", label: "Description", type: "text" },
		{ key: "bgimage", label: "Background Image", type: "text" },
	];

	const [createModelOpen, setCreateModelOpen] = useState<boolean>(false);
	function toggleCreateModel() {
		setCreateModelOpen((prev) => !prev);
	}

	function refreshData() {
		listInvestmentDivisions()
			.then((res) => {
				if (res.error) return console.error(res.error);
				setData(res.data);
				console.log(res);
			})
			.catch((err) => console.error(err));
	}

	function handleDeleteMutation(rowId: string) {
		deleteInvestmentDivision({ investmentdivisionid: rowId })
			.then((res) => {
				if (res.error) return console.error(res.error);
				refreshData();
			})
			.catch((err) => console.error(err));
	}

	return (
		<>
			<CreateModel
				modelName="Investment Division"
				createFields={createFields}
				createMutation={createInvestmentDivision}
				toggleModel={toggleCreateModel}
				modelOpen={createModelOpen}
				afterCreate={refreshData}
			/>
			<div className="w-full h-full p-10">
				<h1 className="text-4xl font-medium mb-6">
					Investment Divisions
				</h1>
				<DataTable
					initialData={data}
					onCreateClick={toggleCreateModel}
					deleteHandler={handleDeleteMutation}
					headers={headers}
					modelName="Investment Division"
					idKey="investmentdivisionid"
					description="A list of all investment divisions displayed on the website and their respective banners."
				/>
			</div>
		</>
	);
}
