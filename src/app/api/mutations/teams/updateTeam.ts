"use server";
import { neon } from "@neondatabase/serverless";

export default async function updateTeam({
	teamId,
	inputs,
}: {
	teamId: string;
	inputs: any;
}) {
	if (!teamId) {
		return { message: "teamId is required" };
	}

	if (!inputs || Object.keys(inputs).length === 0) {
		return { message: "No fields provided for update" };
	}

	// Build dynamic SQL query
	const fieldsToUpdate: any[] = [];
	const values = [];

	Object.entries(inputs).forEach(([key, value], index) => {
		fieldsToUpdate.push(`${key} = $${index + 1}`);
		values.push(value);
	});

	values.push(teamId); // UUID as last parameter
	const queryText = `UPDATE teams SET ${fieldsToUpdate.join(
		", "
	)} WHERE teamid = $${values.length}::UUID RETURNING *`;

	try {
		const DATABASE_URL = process.env.DATABASE_URL;
		if (!DATABASE_URL) return { message: "Missing DATABASE_URL from env" };
		const query = neon(DATABASE_URL);

		const response = await query(queryText, values);

		if (response.length === 0) {
			return { message: "Team not found" };
		}

		return {
			message: "Team updated successfully",
			data: response[0],
		};
	} catch (error) {
		return { message: "Database error", error };
	}
}
