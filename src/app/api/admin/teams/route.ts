import { NextResponse } from "next/server";
import createTeam from "@/lib/mutations/teams/createTeam";
import { listTeams } from "@/lib/queries/teams/listTeams";

export async function GET() {
  const result = await listTeams();
  const status = "error" in result ? 500 : 200;

  return NextResponse.json(result, { status });
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await createTeam(body);
  const status = "error" in result ? 400 : 200;

  return NextResponse.json(result, { status });
}
