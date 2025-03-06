"use client";
import { after } from "node:test";
import React, { useState, useEffect } from "react";

export interface CreateField {
	key: string;
	label: string;
	type:
		| "text"
		| "number"
		| "date"
		| "textarea"
		| "select"
		| "boolean"
		| "image"
		| "multiple-select";
	value?: any;
	extraArgs?: string[];
	readonly?: boolean;
}

interface CreateModelProps {
	modelName: string;
	createFields: CreateField[];
	toggleModel: () => void;
	modelOpen: boolean;
	createMutation: any;
	modelDescription?: string;
	afterCreate?: (input: any) => any;
	extraArgs?: any;
}

export default function CreateModel({
	modelName,
	modelDescription,
	createFields,
	toggleModel,
	modelOpen,
	createMutation,
	afterCreate,
	extraArgs,
}: CreateModelProps) {
	const [inputs, setInputs] = React.useState<any>({});

	const [formData, setFormData] = useState<any>({});
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		setFormData(() => {
			return createFields.reduce((acc: any, field: CreateField) => {
				if (field?.readonly) return acc;
				// if (field.type === 'multiple-select') multiSelectKey = field.key;
				acc[field.key] = {
					value:
						field.value ??
						(field.type === "select"
							? null
							: field.type === "boolean"
							? false
							: field.type === "multiple-select"
							? []
							: null),
					error: "",
					type: field.type,
				};
				return acc;
			}, {});
		});
	}, []);

	async function handleSubmit() {
		setLoading(true);
		if (loading) return;
		const inputs = Object.fromEntries(
			Object.keys(formData).map((key) => {
				let tempKey = key;
				if (formData[key].type === "multiple-select") {
					let value;
					if (formData[key]?.value) {
						value = formData[key].value.map(
							(arr: any) => arr.value
						);
					} else {
						value = [];
					}
					return [key, value];
				}
				if (tempKey.includes(".")) {
					const arr = tempKey.split(".");
					tempKey = arr[arr.length - 1];
				}
				return [tempKey, formData[key].value];
			})
		);

		try {
			const result = await createMutation({
				...inputs,
				...extraArgs,
			});
			if (result.errors) {
				let message =
					"Error creating " +
					modelName.charAt(0).toLowerCase() +
					modelName.slice(1) +
					".\n";
				for (let error of result.errors) {
					message += error.message + "\n";
				}
				console.error(message);
			} else if (afterCreate) {
				afterCreate(result.data);
			}
		} catch (error) {
			console.error(error);
		}
		toggleModel();
		setLoading(false);
	}

	return (
		<div
			className={`flex h-[100vh] w-screen fixed inset-0 z-40 transition-all ${
				!modelOpen
					? "opacity-0 pointer-events-none"
					: "opacity-100 pointer-events-auto"
			}`}
		>
			<div className="h-screen w-screen fixed inset-0 bg-black/50 z-40"></div>
			<div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-fit bg-white rounded-xl border p-6 z-50">
				<div className="w-full justify-between flex items-center gap-12">
					<h1 className="text-2xl font-semibold">
						Create a New {modelName}
					</h1>
					<button
						onClick={() => {
							toggleModel();
							console.log(formData);
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							className="h-8 w-8"
						>
							<path
								fill="none"
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M18 6L6 18M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				{modelDescription && <p>{modelDescription}</p>}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
					className="w-full grid grid-cols-2 gap-4 py-4"
				>
					{createFields.map((field, i) => (
						<div key={i}>
							{field.type === "text" && (
								<div>
									<label
										htmlFor={field.key}
										className="block text-sm font-medium text-gray-700"
									>
										{field.label}
									</label>
									<input
										type="text"
										name={field.key}
										id={field.key}
										value={field.value}
										onChange={(e) => {
											setFormData((prev: any) => ({
												...prev,
												[field.key]: {
													...prev[field.key],
													value: e.target.value,
												},
											}));
										}}
										className="mt-1 block w-full border rounded-md p-1"
									/>
								</div>
							)}
							{field.type === "number" && <div></div>}
							{field.type === "textarea" && <div></div>}
							{field.type === "select" && <div></div>}
							{field.type === "boolean" && <div></div>}
						</div>
					))}
					<div className="col-span-2 flex justify-end">
						<button
							className="text-white font-medium !px-12 bg-primary border-primary btn"
							type="submit"
						>
							Create
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
