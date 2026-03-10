import { NextResponse } from "next/server";

export async function POST(req: Request) {
  void req;
  return NextResponse.json(
    { error: "JIT account creation is disabled. Use admin member provisioning." },
    { status: 410 }
  );
}
