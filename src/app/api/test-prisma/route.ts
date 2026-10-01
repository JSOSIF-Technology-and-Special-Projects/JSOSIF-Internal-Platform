import { supabaseDb } from "@/utils/supabaseDb";

export async function GET() {
  try {
    const { data: teams, error: teamsError } = await supabaseDb.from("teams").select("id, name");
    if (teamsError) throw teamsError;

    const { data: members, error: membersError } = await supabaseDb.from("members").select("id, name");
    if (membersError) throw membersError;

    const { data: holdings, error: holdingsError } = await supabaseDb.from("holdings").select("id, ticker");
    if (holdingsError) throw holdingsError;

    return Response.json({
      success: true,
      teamsCount: teams?.length ?? 0,
      membersCount: members?.length ?? 0,
      holdingsCount: holdings?.length ?? 0,
    });
  } catch (error) {
    console.error("Database test error:", error);
    return Response.json(
      {
        error: "Database connection failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
