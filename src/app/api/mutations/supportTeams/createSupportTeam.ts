"use server";
import { neon } from "@neondatabase/serverless";

export default async function createSupportTeam({
	name,
	description,
}: {
	name: string;
	description: string;
}) {
	if (!name) return { message: "Name is required" };

	try {
		const DATABASE_URL = process.env.DATABASE_URL;
		if (!DATABASE_URL) return { message: "Missing DATABASE_URL from env" };
		const query = neon(DATABASE_URL);

		const response = await query(
			"INSERT INTO supportteams (name, description) VALUES ($1, $2) RETURNING *",
			[name, description]
		);
		return {
			message: "Support Team created successfully",
			data: response[0],
		};
	} catch (error) {
		return { message: "Database error", error };
	}
}
