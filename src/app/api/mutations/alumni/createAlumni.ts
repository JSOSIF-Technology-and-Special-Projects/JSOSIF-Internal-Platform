"use server";
import { neon } from "@neondatabase/serverless";

export default async function createAlumni({
	firstName,
	lastName,
	position,
	company,
	alumniProgram,
	yearsOnFund,
	image,
	blurb,
	linkedIn,
}: {
	firstName: string;
	lastName: string;
	position: string;
	company: string;
	alumniProgram: string;
	yearsOnFund: string;
	image: string;
	blurb: string;
	linkedIn: string;
}) {
	if (!firstName || !lastName || !alumniProgram || !yearsOnFund)
		return {
			message: `Missing required field(s) (firstName, lastName, alumniProgram, yearsOnFund)`,
		};

	try {
		const DATABASE_URL = process.env.DATABASE_URL;
		if (!DATABASE_URL) return { message: "Missing DATABASE_URL from env" };
		const query = neon(DATABASE_URL);

		const response = await query(
			"INSERT INTO members (firstname, lastname, position, company, alumniprogram, yearsonfund, image, blurb, linkedin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
			[
				firstName,
				lastName,
				position ?? "",
				company ?? "",
				alumniProgram,
				yearsOnFund,
				image ?? "",
				blurb ?? "",
				linkedIn ?? "",
			]
		);
		return { message: "Successfully created Alumni", data: response[0] };
	} catch (error) {
		return { message: "Database error", error };
	}
}
