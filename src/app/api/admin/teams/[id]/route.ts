import { NextResponse } from "next/server";
import updateTeam from "@/lib/mutations/teams/updateTeam";
import deleteTeam from "@/lib/mutations/teams/deleteTeam";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return NextResponse.json({ error: "Expected an object of fields to update" }, { status: 400 });
  }
  const result = await updateTeam({ teamId: id, input });
  return NextResponse.json(result, { status: "error" in result ? 400 : 200 });
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  const result = await deleteTeam({ teamId: id });
  return NextResponse.json(result, { status: "error" in result ? 400 : 200 });
}
