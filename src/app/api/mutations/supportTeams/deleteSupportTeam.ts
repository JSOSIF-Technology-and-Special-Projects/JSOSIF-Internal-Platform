"use server";
import { neon } from "@neondatabase/serverless";

export default async function deleteSupportTeam({
	supportTeamId,
}: {
	supportTeamId: string;
}) {
	// Validate UUID format before querying
	if (!supportTeamId || !/^[0-9a-fA-F-]{36}$/.test(supportTeamId)) {
		return { message: "Valid supportTeamId (UUID) is required" };
	}

	try {
		const DATABASE_URL = process.env.DATABASE_URL;
		if (!DATABASE_URL) return { message: "Missing DATABASE_URL from env" };
		const query = neon(DATABASE_URL);

		const response = await query(
			"DELETE FROM supportteams WHERE supportteamid = $1::UUID RETURNING *",
			[supportTeamId]
		);

		if (response.length === 0) {
			return { message: "SupportTeam not found" };
		}

		return {
			message: "SupportTeam deleted successfully",
			data: response[0],
		};
	} catch (error) {
		return { message: "Database error", error };
	}
}
