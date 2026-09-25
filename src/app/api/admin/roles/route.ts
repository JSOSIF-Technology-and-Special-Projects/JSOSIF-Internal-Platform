import { NextResponse } from "next/server";
import { listRoles } from "@/lib/queries/roles/listRoles";

export async function GET() {
  const result = await listRoles();
  const status = "error" in result ? 500 : 200;

  return NextResponse.json(result, { status });
}
