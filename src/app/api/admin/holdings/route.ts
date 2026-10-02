import { NextResponse } from "next/server";
import { listHoldings } from "@/lib/queries/holdings/listHoldings";
import createHolding from "@/lib/mutations/holdings/createHolding";

export async function GET() {
  const result = await listHoldings();
  return NextResponse.json(result, { status: "error" in result ? 500 : 200 });
}

export async function POST(request: Request) {
  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return NextResponse.json({ error: "Expected holding fields" }, { status: 400 });
  }
  const result = await createHolding(input);
  return NextResponse.json(result, { status: "error" in result ? 400 : 200 });
}
