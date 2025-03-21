"use server";
import { neon } from "@neondatabase/serverless";

export default async function deleteTeam({ teamId }: { teamId: string }) {
	// Validate UUID format before querying
	if (!teamId || !/^[0-9a-fA-F-]{36}$/.test(teamId)) {
		return { message: "Valid teamId (UUID) is required" };
	}

	try {
		const DATABASE_URL = process.env.DATABASE_URL;
		if (!DATABASE_URL) return { message: "Missing DATABASE_URL from env" };
		const query = neon(DATABASE_URL);

		const response = await query(
			"DELETE FROM teams WHERE teamid = $1::UUID RETURNING *",
			[teamId]
		);

		if (response.length === 0) {
			return { message: "Team not found" };
		}

		return { message: "Team deleted successfully", data: response[0] };
	} catch (error) {
		return { message: "Database error", error };
	}
}
