import { NextResponse } from "next/server";
import createMember from "@/lib/mutations/members/createMember";
import { listMembers } from "@/lib/queries/members/listMembers";

export async function GET() {
  const result = await listMembers();
  const status = "error" in result ? 500 : 200;

  return NextResponse.json(result, { status });
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await createMember(body);
  const status = "error" in result ? 400 : 200;

  return NextResponse.json(result, { status });
}
