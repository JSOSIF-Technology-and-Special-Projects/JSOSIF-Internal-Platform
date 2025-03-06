"use server";
import { neon } from "@neondatabase/serverless";

export default async function createInvestmentDivision({
	name,
	description,
	bgimage,
}: {
	name: string;
	description: string;
	bgimage: string;
}) {
	if (!name || !description || !bgimage)
		return {
			message: `Missing required field(s) (name, description, bgimage)`,
		};

	try {
		const DATABASE_URL = process.env.DATABASE_URL;
		if (!DATABASE_URL) return { message: "Missing DATABASE_URL from env" };
		const query = neon(DATABASE_URL);

		const response = await query(
			"INSERT INTO investmentdivisions (name, description, bgimage) VALUES ($1, $2, $3) RETURNING *",
			[name, description, bgimage]
		);
		return {
			message: "Successfully created Investment Division",
			data: response[0],
		};
	} catch (error) {
		return { message: "Database error", error };
	}
}
