"use server";
import { neon } from "@neondatabase/serverless";

export default async function deleteInvestmentDivision({
	investmentdivisionid,
}: {
	investmentdivisionid: string;
}) {
	// Validate UUID format before querying
	if (
		!investmentdivisionid ||
		!/^[0-9a-fA-F-]{36}$/.test(investmentdivisionid)
	) {
		return { message: "Valid investmentdivisionid (UUID) is required" };
	}

	try {
		const DATABASE_URL = process.env.DATABASE_URL;
		if (!DATABASE_URL) return { message: "Missing DATABASE_URL from env" };
		const query = neon(DATABASE_URL);

		const response = await query(
			"DELETE FROM investmentdivisions WHERE investmentdivisionid = $1::UUID RETURNING *",
			[investmentdivisionid]
		);

		if (response.length === 0) {
			return { message: "InvestmentDivision not found" };
		}

		return {
			message: "InvestmentDivision deleted successfully",
			data: response[0],
		};
	} catch (error) {
		return { message: "Database error", error };
	}
}
