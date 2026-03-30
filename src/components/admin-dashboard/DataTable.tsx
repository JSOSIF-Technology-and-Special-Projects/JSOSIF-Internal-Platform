"use client";

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
  styles?: string;
}

interface DatatableProps {
	initialData: any[] | ["empty"];
	onCreateClick: () => void;
	headers: Header[];
	modelName: string;
	idKey: string;
	description?: string;
	inspectLink?: string;
	onDelete?: (id: string | number, e?: React.MouseEvent<HTMLButtonElement>) => void;
	enablePagination?: boolean;
	rowsPerPage?: number;
	fillEmptyRows?: boolean;
	allowRowsPerPageInput?: boolean;
}

export default function DataTable({
	initialData,
	onCreateClick,
	headers,
	modelName,
	idKey,
	description,
	inspectLink,
	onDelete,
	enablePagination = false,
	rowsPerPage = 8,
	fillEmptyRows = false,
	allowRowsPerPageInput = false,
}: DatatableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPageValue, setRowsPerPageValue] = React.useState(
    Math.max(rowsPerPage, 1)
  );
  const [rowsPerPageInput, setRowsPerPageInput] = React.useState(
    String(Math.max(rowsPerPage, 1))
  );
  const rowsPerPageOptions = [8, 16, 32];

  React.useEffect(() => {
    const next = Math.max(rowsPerPage, 1);
    setRowsPerPageValue(next);
    setRowsPerPageInput(String(next));
  }, [rowsPerPage]);

  const hasData =
    Array.isArray(initialData) &&
    initialData.length > 0 &&
    initialData[0] !== "empty";
  const isLoading =
    Array.isArray(initialData) &&
    initialData.length > 0 &&
    initialData[0] === "empty";
  const dataRows = hasData ? initialData : [];
  const normalizedRowsPerPage = Math.max(rowsPerPageValue, 1);
  const shouldPaginate = enablePagination && hasData;
  const totalPages = shouldPaginate
    ? Math.max(1, Math.ceil(dataRows.length / normalizedRowsPerPage))
    : 1;

  React.useEffect(() => {
    setCurrentPage((prev) => Math.min(Math.max(prev, 1), totalPages));
  }, [totalPages]);

  const start = shouldPaginate ? (currentPage - 1) * normalizedRowsPerPage : 0;
  const visibleRows = shouldPaginate
    ? dataRows.slice(start, start + normalizedRowsPerPage)
    : dataRows;
  const emptyRowsCount =
    fillEmptyRows && shouldPaginate
      ? Math.max(0, normalizedRowsPerPage - visibleRows.length)
      : 0;
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  function goToPage(page: number) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  function applyRowsPerPage(nextValue: number) {
    const nextRowsPerPage = Math.max(nextValue, 1);
    setRowsPerPageValue(nextRowsPerPage);
    setRowsPerPageInput(String(nextRowsPerPage));
    setCurrentPage(1);
  }

  function applyRowsPerPageInput(rawValue: string) {
    const parsedValue = Number.parseInt(rawValue, 10);
    if (Number.isNaN(parsedValue)) {
      setRowsPerPageInput(String(rowsPerPageValue));
      return;
    }

    applyRowsPerPage(parsedValue);
  }

  function onRowsPerPageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setRowsPerPageInput(event.target.value);
  }

  function onRowsPerPageKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      applyRowsPerPageInput(rowsPerPageInput);
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      const inputElement = event.currentTarget;
      setTimeout(() => {
        applyRowsPerPageInput(inputElement.value);
      }, 0);
    }
  }

  function onRowsPerPageBlur() {
    const parsedValue = Number.parseInt(rowsPerPageInput, 10);
    if (Number.isNaN(parsedValue) || parsedValue < 1) {
      setRowsPerPageInput(String(rowsPerPageValue));
    }
  }

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
    <div className="h-full w-full">
      {/* Table options/dropdowns */}
      <div className="border rounded-2xl p-8">
        <div className="flex justify-between items-center px-4">
          <div className="text-sm">{description}</div>
          <div>
            <button
              onClick={onCreateClick}
              className="btn flex items-center gap-2 shrink-0"
            >
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
              Add New {modelName}
            </button>
          </div>
        </div>

				{/* Table */}
				<div className="mt-4">
					<div className="px-4 overflow-x-auto" id="data-table-wrapper">
						<table className="h-full w-full">
							<thead className="border-b h-10">
								<tr className="text-left px-10">
									{headers.map((header, i) => (
										<th
											className="!p-4 text-nowrap"
											key={i}
										>
											{header.label}
										</th>
									))}
								</tr>
							</thead>
							{hasData ? (
								<tbody>
									{visibleRows.map((row, i) => (
										<tr
											key={i}
											className={`${
												i !== visibleRows.length - 1 ||
												emptyRowsCount > 0
													? "border-b"
													: ""
											}
										relative group`}
										>
											{headers.map((header, i) => (
												<td
													key={i}
													className="!p-4 !pr-20"
												>
													<p
														className={`relative z-10 text-wrap w-fit ${header?.styles}`}
													>
														{findKeyValue(
															row,
															header
														)}
													</p>
													{/* Support functions */}
													{i === 0 ? (
														<>
															<div className="right-0 top-1/2 -translate-y-1/2 absolute opacity-0 pointer-events-none flex group-hover:opacity-100 group-hover:pointer-events-auto gap-2 items-center h-full transition-all px-4 z-10">
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	const id = findKeyValue(row, {
																		key: idKey,
																		label: "",
																		resolver: (r) => r[idKey],
																	});
															
																	onDelete?.(id, e); 
																}}
																className="w-8 h-8 rounded-full flex items-center justify-center p-1"
														>
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
															<a
																href={`/app/${
																	(inspectLink
																		? inspectLink
																		: modelName
																				.toLowerCase()
																				.replaceAll(
																					" ",
																					"-"
																				)
																				.concat(
																					"s"
																				)) +
																	"/" +
																	findKeyValue(
																		row,
																		{
																			key: idKey,
																			label: "",
																			resolver:
																				(
																					row
																				) =>
																					row[
																						idKey
																					],
																		}
																	)
																}`}
																className="absolute right-0 top-1/2 -translate-y-1/2 w-full rounded-lg h-full transition-colors bg-transparent group-hover:bg-base-200"
															/>
														</>
													) : (
														""
													)}
												</td>
											))}
										</tr>
									))}
									{Array.from({ length: emptyRowsCount }).map((_, i) => (
										<tr
											key={`empty-row-${i}`}
											className={i === emptyRowsCount - 1 ? "" : "border-b"}
										>
											{headers.map((header, headerIndex) => (
												<td
													key={`empty-cell-${header.key}-${headerIndex}`}
													className="!p-4 !pr-20"
												>
													&nbsp;
												</td>
											))}
										</tr>
									))}
								</tbody>
							) : (
								""
							)}
						</table>
						{!initialData?.length && !isLoading ? (
							<div className= "w-full py-10 flex flex-col gap-4 justify-center items-center text-center text-base-300">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="w-24 h-24 text-base-300"
									viewBox="0 0 24 24"
								>
									<g fill="none">
										<path
											fill="currentColor"
											d="M16 10.5c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5s.448-1.5 1-1.5s1 .672 1 1.5"
										/>
										<ellipse
											cx="9"
											cy="10.5"
											fill="currentColor"
											rx="1"
											ry="1.5"
										/>
										<path
											stroke="currentColor"
											strokeWidth="1.5"
											d="M22 19.723v-7.422C22 6.61 17.523 2 12 2S2 6.612 2 12.3v7.423c0 1.322 1.351 2.182 2.5 1.591a2.82 2.82 0 0 1 2.896.186a2.82 2.82 0 0 0 3.208 0l.353-.242a1.84 1.84 0 0 1 2.086 0l.353.242a2.82 2.82 0 0 0 3.208 0a2.82 2.82 0 0 1 2.897-.186c1.148.591 2.499-.269 2.499-1.591Z"
											opacity=".5"
										/>
									</g>
								</svg>
								No {modelName} Found
							</div>
						) : isLoading ? (
							<div className="w-full py-10 mx-auto flex justify-center items-center">
								<div
									className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
									role="status"
								>
									<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
										Loading...
									</span>
								</div>
							</div>
						) : (
							""
						)}
					</div>
					{shouldPaginate && (
						<div className="pt-5">
              {allowRowsPerPageInput && (
                <div className="flex justify-end items-center flex-wrap gap-3 px-4 mb-3">
                  <span className="text-sm text-gray-600">Rows per page</span>

                  <div className="flex items-center gap-2">
                    {rowsPerPageOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => applyRowsPerPage(option)}
                        className={`h-8 px-3 rounded-md border text-sm transition-colors ${
                          rowsPerPageValue === option
                            ? "bg-[#0E5791] text-white border-[#0E5791]"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    Custom
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={rowsPerPageInput}
                      onChange={onRowsPerPageChange}
                      onKeyDown={onRowsPerPageKeyDown}
                      onBlur={onRowsPerPageBlur}
                      className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => applyRowsPerPageInput(rowsPerPageInput)}
                    className="h-8 px-3 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Apply
                  </button>
                </div>
              )}
							<div className="flex justify-center items-center gap-4">
								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => goToPage(1)}
										disabled={isFirstPage}
										className={`${
											isFirstPage
												? "opacity-40 cursor-not-allowed"
												: ""
										}`}
									>
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
									<button
										type="button"
										onClick={() => goToPage(currentPage - 1)}
										disabled={isFirstPage}
										className={`${
											isFirstPage
												? "opacity-40 cursor-not-allowed"
												: ""
										}`}
									>
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
									<button
										type="button"
										className="border min-w-10 h-10 px-3 rounded-xl text-lg font-medium"
									>
										{currentPage} / {totalPages}
									</button>
								</div>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => goToPage(currentPage + 1)}
										disabled={isLastPage}
										className={`${
											isLastPage
												? "opacity-40 cursor-not-allowed"
												: ""
										}`}
									>
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
									<button
										type="button"
										onClick={() => goToPage(totalPages)}
										disabled={isLastPage}
										className={`${
											isLastPage
												? "opacity-40 cursor-not-allowed"
												: ""
										}`}
									>
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
					)}
				</div>
			</div>
		</div>
	);
}
