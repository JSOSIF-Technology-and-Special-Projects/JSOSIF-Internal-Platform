"use server";
import { neon } from "@neondatabase/serverless";
import { Args } from "@/utils/interfaces";

export async function listAlumni({
	limit,
	offset,
	query,
	sortDirection,
	sortField,
}: Args) {
	try {
		const DATABASE_URL = process.env.DATABASE_URL;
		if (!DATABASE_URL)
			return {
				message: "Missing DATABASE_URL from env",
				data: [],
				count: 0,
			};

		const db = neon(DATABASE_URL);

		// Base Query for Data Retrieval
		let sql = "SELECT * FROM alumni";
		let countSql = "SELECT COUNT(*) FROM alumni";
		const values: any[] = [];

		// Apply Filtering if Query is Provided
		if (query) {
			values.push(`%${query}%`);
			sql += ` WHERE name ILIKE $${values.length}`;
			countSql += ` WHERE name ILIKE $${values.length}`;
		}

		// Sorting (Optional)
		if (sortField) {
			const direction = sortDirection === "DESC" ? "DESC" : "ASC";
			sql += ` ORDER BY ${sortField} ${direction}`;
		}

		// Pagination (Limit and Offset)
		if (limit) {
			values.push(limit);
			sql += ` LIMIT $${values.length}`;
		}

		if (offset) {
			values.push(offset);
			sql += ` OFFSET $${values.length}`;
		}

		// Execute Queries in Parallel
		const [dataResponse, countResponse] = await Promise.all([
			db(sql, values),
			db(countSql, values.slice(0, query ? 1 : 0)), // Slice values to avoid incorrect index issues
		]);

		const totalCount = parseInt(countResponse[0]?.count || "0", 10);

		// Return Data + Total Count for Pagination
		return {
			message: "List query ran successfully",
			data: dataResponse,
			count: totalCount,
		};
	} catch (error) {
		return { message: "Database error", error };
	}
}
