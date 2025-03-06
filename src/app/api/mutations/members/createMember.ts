"use server";
import { neon } from "@neondatabase/serverless";

export default async function createMember({
	firstname,
	lastname,
	role,
	program,
	year,
	joined,
	image,
	linkedIn,
	teamId,
}: {
	firstname: string;
	lastname: string;
	role: string;
	program: string;
	year: string;
	joined: string;
	image: string;
	linkedIn: string;
	teamId: string;
}) {
	if (
		!firstname ||
		!lastname ||
		!role ||
		!program ||
		!year
		// || !joined
		// || !teamId // TODO: ADD BACK IN WHEN TEAMS ARE IMPLEMENTED
	)
		return {
			message: `Missing required field(s) (firstname, lastname, role, program, year, joined, teamId)`,
			error: "Missing required field(s) (firstname, lastname, role, program, year, joined, teamId)",
		};

	try {
		const DATABASE_URL = process.env.DATABASE_URL;
		if (!DATABASE_URL) return { message: "Missing DATABASE_URL from env" };
		const query = neon(DATABASE_URL);

		const response = await query(
			// "INSERT INTO members (firstname, lastname, role, program, year, joined, image, linkedin, teamid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
			"INSERT INTO members (firstname, lastname, role, program, year, image, linkedin) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
			[
				firstname,
				lastname,
				role,
				program,
				year,
				// joined,
				image ?? "",
				linkedIn ?? "",
				// teamId,
			]
		);
		return { message: "Member created successfully", data: response[0] };
	} catch (error) {
		return { message: "Database error", error };
	}
}
