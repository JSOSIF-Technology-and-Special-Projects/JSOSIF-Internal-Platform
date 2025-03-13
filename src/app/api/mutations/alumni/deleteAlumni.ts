"use server";
import { neon } from "@neondatabase/serverless";

export default async function deleteAlumni({ alumniId }: { alumniId: string }) {
	// Validate UUID format before querying
	if (!alumniId || !/^[0-9a-fA-F-]{36}$/.test(alumniId)) {
		return { message: "Valid alumniId (UUID) is required" };
	}

	try {
		const DATABASE_URL = process.env.DATABASE_URL;
		if (!DATABASE_URL) return { message: "Missing DATABASE_URL from env" };
		const query = neon(DATABASE_URL);

		const response = await query(
			"DELETE FROM alumni WHERE alumniid = $1::UUID RETURNING *",
			[alumniId]
		);

		if (response.length === 0) {
			return { message: "Alumni not found" };
		}

		return {
			message: "Alumni deleted successfully",
			alumni: response[0],
		};
	} catch (error) {
		return { message: "Database error", error };
	}
}
