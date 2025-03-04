import React from "react";

export interface Header {
	key: string;
	label: string;
	isNameKey?: boolean;
	resolver?: (row: any) => any;
	sortable?: boolean;
	sortKey?: string;
	sortDirection?: "asc" | "desc";
	onClick?: (key: string) => void;
}

interface DatatableProps {
	initialData: any[];
	headers: Header[];
	modelName: string;
	description?: string;
}

export default function DataTable({
	initialData,
	headers,
	modelName,
	description,
}: DatatableProps) {
	// The field that represents the name of the item
	const nameKey = headers.find((header) => header.isNameKey)?.key ?? "name";

	function findKeyValue(row: any, headers: Header) {
		let keyValue = "";

		// If the header has a resolver, use it
		if (headers?.resolver) return headers.resolver(row);

		// If the header has a key, use it
		const key = headers.key.split(".");
		for (let i = 0; i < key.length; i++) {
			// If the value is undefined or null, return an empty string
			if (typeof row[key[i]] == "undefined" || row[key[i]] == null)
				return keyValue;
			keyValue = row[key[i]];
		}
		// If the value is a boolean, return a checkmark or an x TODO: Update the icons so it doesnt look ugly
		if (typeof keyValue == "boolean") {
			if (keyValue) return "✓";
			else return "✗";
		}

		return keyValue;
	}

	return (
		<div className="w-full h-full">
			{/* Table options/dropdowns */}
			<div className="border rounded-2xl p-8">
				<div className="flex justify-between items-center px-4">
					<div className="text-sm">{description}</div>
					<div>
						<button className="btn flex items-center gap-2 shrink-0">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								className="w-5 h-5"
							>
								<path
									fill="currentColor"
									d="M12 21q-.425 0-.712-.288T11 20v-7H4q-.425 0-.712-.288T3 12t.288-.712T4 11h7V4q0-.425.288-.712T12 3t.713.288T13 4v7h7q.425 0 .713.288T21 12t-.288.713T20 13h-7v7q0 .425-.288.713T12 21"
								/>
							</svg>{" "}
							Create {modelName}
						</button>
					</div>
				</div>

				{/* Table */}
				<div className="mt-4">
					<div className="px-4">
						<table className="h-full w-full">
							<thead className="border-b h-10">
								<tr className="text-left px-10">
									{headers.map((header, i) => (
										<th className="!p-4" key={i}>
											{header.label}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{initialData.map((row, i) => (
									<tr
										key={row.i}
										className={`${
											i !== initialData.length - 1 &&
											"border-b"
										}
										w-full relative group`}
									>
										{headers.map((header) => (
											<td
												key={header.key}
												className="!p-4"
											>
												{findKeyValue(row, header)}
												{/* Support functions */}
												<div className="right-0 top-1/2 -translate-y-1/2 absolute opacity-0 pointer-events-none flex group-hover:opacity-100 group-hover:pointer-events-auto gap-2 items-center justify-center h-full from-transparent to-15% transition-all to-white bg-gradient-to-r px-10">
													<button className="w-8 h-8 rounded-full flex items-center justify-center p-1">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															viewBox="0 0 24 24"
														>
															<path
																fill="none"
																stroke="currentColor"
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth="2"
																d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"
															/>
														</svg>
													</button>
												</div>
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
						<div className="pt-10">
							{/* Pagination here */}
							<div className="flex justify-center items-center">
								<div className="flex gap-4">
									<button className="">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="32"
											height="32"
											viewBox="0 0 24 24"
										>
											<path
												fill="none"
												stroke="currentColor"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="m11 7l-5 5l5 5m6-10l-5 5l5 5"
											/>
										</svg>
									</button>
									<button className="">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="32"
											height="32"
											viewBox="0 0 24 24"
										>
											<path
												fill="none"
												stroke="currentColor"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="m15 6l-6 6l6 6"
											/>
										</svg>
									</button>
								</div>
								<div>
									<button className="border min-w-10 h-10 px-3 rounded-xl text-lg font-medium">
										1
									</button>
								</div>
								<div className="flex gap-4">
									<button className="">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="32"
											height="32"
											viewBox="0 0 24 24"
										>
											<path
												fill="none"
												stroke="currentColor"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="m9 6l6 6l-6 6"
											/>
										</svg>
									</button>
									<button className="">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="32"
											height="32"
											viewBox="0 0 24 24"
										>
											<path
												fill="none"
												stroke="currentColor"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="m7 7l5 5l-5 5m6-10l5 5l-5 5"
											/>
										</svg>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
