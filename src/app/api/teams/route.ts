import { supabaseDb, formatDbError } from "@/utils/supabaseDb";

export async function GET() {
  try {
    const { data: rawTeams, error } = await supabaseDb
      .from("teams")
      .select("id, name, team_type")
      .order("name", { ascending: true });

    if (error) throw error;

    const teams = (rawTeams || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      teamType: t.team_type,
      team_type: t.team_type,
    }));

    return Response.json(teams);
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      {
        error: "Database query failed",
        message: formatDbError(error),
      },
      { status: 500 }
    );
  }
}
