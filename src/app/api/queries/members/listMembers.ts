"use server";
import { neon } from "@neondatabase/serverless";

export async function listMembers() {
	try {
		const DATABASE_URL = process.env.DATABASE_URL;
		if (!DATABASE_URL) return { message: "Missing DATABASE_URL from env" };
		const query = neon(DATABASE_URL);

		const response = await query("SELECT * FROM members", []);
		return { message: "List query ran successfully", data: response };
	} catch (error) {
		return { message: "Database error", error };
	}
}
