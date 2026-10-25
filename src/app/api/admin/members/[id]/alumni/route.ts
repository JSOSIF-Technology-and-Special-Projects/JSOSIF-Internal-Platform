import { NextResponse } from "next/server";
import moveMemberToAlumni from "@/lib/mutations/members/moveMemberToAlumni";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const result = await moveMemberToAlumni({ memberId: id, input });
  return NextResponse.json(result, { status: result.status });
}
