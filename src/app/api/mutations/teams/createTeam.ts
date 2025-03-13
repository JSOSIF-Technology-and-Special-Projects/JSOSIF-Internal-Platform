"use server";
// import { query } from "@/lib/db";
import { neon } from "@neondatabase/serverless";

export interface CreateTeam {
	name: string;
	banner: string;
}

export default async function createTeam({ name, banner }: CreateTeam) {
	if (!name) return { message: "Name is required" };

	try {
		const DATABASE_URL = process.env.DATABASE_URL;
		if (!DATABASE_URL) return { message: "Missing DATABASE_URL from env" };
		const query = neon(DATABASE_URL);
		const response = await query(
			"INSERT INTO teams (name, banner) VALUES ($1, $2) RETURNING *",
			[name, banner]
		);
		return { message: "Team created successfully", data: response[0] };
	} catch (error) {
		return { message: "Database error", error };
	}
}
