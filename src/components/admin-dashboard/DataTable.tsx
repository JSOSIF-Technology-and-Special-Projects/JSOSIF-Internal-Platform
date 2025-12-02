"use client";

import React, { useEffect } from "react";

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
}

export default function DataTable({
  initialData,
  onCreateClick,
  headers,
  modelName,
  idKey,
  description,
  inspectLink,
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

  useEffect(() => {
    console.log(initialData);
  }, [initialData]);

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
          <div className="px-4 overflow-x-auto">
            <table className="h-full w-full">
              <thead className="border-b h-10">
                <tr className="text-left px-10">
                  {headers.map((header, i) => (
                    <th className="!p-4 text-nowrap" key={i}>
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              {initialData?.length && initialData[0] !== "empty" ? (
                <tbody>
                  {initialData.map((row, i) => (
                    <tr
                      key={i}
                      className={`${i !== initialData.length - 1 && "border-b"}
										relative group`}
                    >
                      {headers.map((header, i) => (
                        <td key={i} className="!p-4 !pr-20">
                          <p
                            className={`relative z-10 text-wrap w-fit ${header?.styles}`}
                          >
                            {findKeyValue(row, header)}
                          </p>
                          {/* Support functions - Disabled for now since detail pages don't exist */}
                          {i === 0 ? (
                            <>
                              <div className="right-0 top-1/2 -translate-y-1/2 absolute opacity-0 pointer-events-none flex group-hover:opacity-100 group-hover:pointer-events-auto gap-2 items-center h-full transition-all px-4 z-10">
                                <button className="w-8 h-8 rounded-full flex items-center justify-center p-1 text-red-500 hover:text-red-700">
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
                              {/* Removed the problematic link that was causing 404 errors */}
                            </>
                          ) : (
                            ""
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ) : (
                ""
              )}
            </table>
            {!initialData?.length && initialData[0] !== "empty" ? (
              <div className="w-full py-10 flex flex-col gap-4 justify-center items-center text-center text-base-300">
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
            ) : initialData?.length && initialData[0] == "empty" ? (
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
          <div className="pt-5">
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
  );
}
