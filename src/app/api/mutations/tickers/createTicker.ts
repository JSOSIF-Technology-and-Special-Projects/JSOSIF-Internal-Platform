"use server";
import { neon } from "@neondatabase/serverless";

export default async function createTicker({
	ticker,
	label,
	investmentDivisionId,
}: {
	ticker: string;
	label: string;
	investmentDivisionId: string;
}) {
	if (!investmentDivisionId)
		return { message: "investmentDivisionId is required" };
	else if (!ticker) return { message: "ticker is required" };

	try {
		const DATABASE_URL = process.env.DATABASE_URL;
		if (!DATABASE_URL) return { message: "Missing DATABASE_URL from env" };
		const query = neon(DATABASE_URL);

		const response = await query(
			"INSERT INTO tickers (ticker, label, investmentdivisionid) VALUES ($1, $2, $3) RETURNING *",
			[ticker, label, investmentDivisionId]
		);
		return { message: "Ticker created successfully", data: response[0] };
	} catch (error) {
		return { message: "Database error", error };
	}
}
