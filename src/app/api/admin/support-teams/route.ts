import { NextResponse } from "next/server";
import createSupportTeam from "@/lib/mutations/supportTeams/createSupportTeam";
import { listSupportTeams } from "@/lib/queries/supportTeams/listSupportTeams";

export async function GET() {
  const result = await listSupportTeams();
  const status = "error" in result ? 500 : 200;

  return NextResponse.json(result, { status });
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await createSupportTeam(body);
  const status = "error" in result ? 400 : 200;

  return NextResponse.json(result, { status });
}
