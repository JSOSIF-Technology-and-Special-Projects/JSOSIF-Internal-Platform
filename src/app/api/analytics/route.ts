import { NextResponse } from "next/server";
export async function GET(): Promise<NextResponse<{ error: string }>> {
  return NextResponse.json(
    { error: "Analytics functionality has been removed." },
    { status: 410 }
  );
}
