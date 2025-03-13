"use server";
import { neon } from "@neondatabase/serverless";

export default async function deleteTicker({ tickerid }: { tickerid: string }) {
	// Validate UUID format before querying
	if (!tickerid || !/^[0-9a-fA-F-]{36}$/.test(tickerid)) {
		return { message: "Valid tickerid (UUID) is required" };
	}

	try {
		const DATABASE_URL = process.env.DATABASE_URL;
		if (!DATABASE_URL) return { message: "Missing DATABASE_URL from env" };
		const query = neon(DATABASE_URL);

		const response = await query(
			"DELETE FROM tickers WHERE tickerid = $1::UUID RETURNING *",
			[tickerid]
		);

		if (response.length === 0) {
			return { message: "Ticker not found" };
		}

		return {
			message: "Ticker deleted successfully",
			data: response[0],
		};
	} catch (error) {
		return { message: "Database error", error };
	}
}
