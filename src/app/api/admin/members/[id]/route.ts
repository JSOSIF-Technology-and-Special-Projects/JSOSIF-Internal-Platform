import { NextResponse } from "next/server";
import updateMember from "@/lib/mutations/members/updateMember";
import deleteMember from "@/lib/mutations/members/deleteMember";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const result = await updateMember({ memberId: id, input });
  return NextResponse.json(result, { status: "error" in result ? 400 : 200 });
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  const result = await deleteMember({ memberId: id });
  return NextResponse.json(result, { status: "error" in result ? 400 : 200 });
}
