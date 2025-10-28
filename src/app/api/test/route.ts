import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";

export async function GET() {

    const cookieStore = await cookies() as unknown as ReadonlyRequestCookies;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );

  // Replace "todos" with any real table name in your DB
  const { data, error } = await supabase.from("test_table").select("name, test_num_2, test_num");

  if (error) {
    return NextResponse.json({ connected: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ connected: true, sampleData: data });
}
