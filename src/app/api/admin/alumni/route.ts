import { NextResponse } from "next/server";
import createAlumni from "@/lib/mutations/alumni/createAlumni";
import { listAlumni } from "@/lib/queries/alumni/listAlumni";

export async function GET() {
  const result = await listAlumni();
  const status = "error" in result ? 500 : 200;

  return NextResponse.json(result, { status });
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await createAlumni(body);
  const status = "error" in result ? 400 : 200;

  return NextResponse.json(result, { status });
}
