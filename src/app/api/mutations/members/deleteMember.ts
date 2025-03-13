"use server";
import { neon } from "@neondatabase/serverless";

export default async function deleteMember({ memberid }: { memberid: string }) {
	// Validate UUID format before querying
	if (!memberid || !/^[0-9a-fA-F-]{36}$/.test(memberid)) {
		return { message: "Valid memberid (UUID) is required" };
	}

	try {
		const DATABASE_URL = process.env.DATABASE_URL;
		if (!DATABASE_URL) return { message: "Missing DATABASE_URL from env" };
		const query = neon(DATABASE_URL);

		const response = await query(
			"DELETE FROM members WHERE memberid = $1::UUID RETURNING *",
			[memberid]
		);

		if (response.length === 0) {
			return { message: "Member not found" };
		}

		return {
			message: "Member deleted successfully",
			data: response[0],
		};
	} catch (error) {
		return { message: "Database error", error };
	}
}
