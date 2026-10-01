import { supabaseDb, generateId } from "@/utils/supabaseDb";

export const dynamic = "force-dynamic";

/**
 * GET /api/portfolio/cash
 * Retrieves the authoritative fund cash balance from the database `holdings` table (ticker = 'CASH').
 * If no CASH record exists yet, automatically seeds one with default $25,000 CAD.
 */
export async function GET() {
  try {
    // 1. Check for existing CASH holding
    const { data: existingCash, error: fetchError } = await supabaseDb
      .from("holdings")
      .select("id, ticker, name, costCad, amount_in_shares, updated_at, team_id")
      .eq("ticker", "CASH")
      .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (existingCash) {
      const shares = Number(existingCash.amount_in_shares || 1);
      const costCad = Number(existingCash.costCad || 0);
      const balance = shares * costCad;

      return Response.json({
        success: true,
        cashBalance: balance,
        holdingId: existingCash.id,
        updatedAt: existingCash.updated_at,
      });
    }

    // 2. If not found, look up Executive or first available team for foreign key
    const { data: teams } = await supabaseDb
      .from("teams")
      .select("id, name")
      .limit(10);

    const execTeam =
      teams?.find((t: any) => t.name?.toLowerCase().includes("exec")) ||
      teams?.[0];

    const teamId = execTeam?.id || "eccb41aa-da47-46f1-90cf-c836f6e640e1";
    const newId = generateId();
    const now = new Date().toISOString();
    const initialCash = 25000;

    const { data: created, error: insertError } = await supabaseDb
      .from("holdings")
      .insert({
        id: newId,
        team_id: teamId,
        ticker: "CASH",
        name: "Fund Cash Reserve",
        description: "Official JSOSIF operational liquidity & settlement cash reserve",
        industry: "Cash & Equivalents",
        amount_in_shares: 1,
        costCad: initialCash,
        invest_date: now.slice(0, 10),
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[portfolio/cash] Error inserting initial cash record:", insertError);
      // Fallback response with initial cash if DB write fails
      return Response.json({
        success: true,
        cashBalance: initialCash,
        warning: "Operating on in-memory initial cash fallback",
      });
    }

    return Response.json({
      success: true,
      cashBalance: initialCash,
      holdingId: created.id,
      updatedAt: created.updated_at,
      isInitialSeeded: true,
    });
  } catch (error) {
    console.error("[portfolio/cash] GET error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to retrieve cash balance from database",
        message: error instanceof Error ? error.message : "Unknown error",
        cashBalance: 25000,
      },
      { status: 500 }
    );
  }
}

/**
 * POST / PUT /api/portfolio/cash
 * Updates the fund cash reserve in the database.
 * Body: { cashBalance: number }
 */
export async function POST(req: Request) {
  return handleUpdateCash(req);
}

export async function PUT(req: Request) {
  return handleUpdateCash(req);
}

async function handleUpdateCash(req: Request) {
  try {
    const body = await req.json();
    const cashBalance = Number(body.cashBalance);

    if (isNaN(cashBalance) || cashBalance < 0) {
      return Response.json(
        { error: "Invalid cashBalance. Must be a non-negative number." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Check if CASH record exists
    const { data: existingCash } = await supabaseDb
      .from("holdings")
      .select("id")
      .eq("ticker", "CASH")
      .maybeSingle();

    if (existingCash) {
      const { data: updated, error: updateError } = await supabaseDb
        .from("holdings")
        .update({
          costCad: cashBalance,
          amount_in_shares: 1,
          updated_at: now,
        })
        .eq("id", existingCash.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return Response.json({
        success: true,
        cashBalance: Number(updated.costCad),
        holdingId: updated.id,
        updatedAt: updated.updated_at,
      });
    } else {
      // Find team for new record
      const { data: teams } = await supabaseDb
        .from("teams")
        .select("id, name")
        .limit(10);

      const execTeam =
        teams?.find((t: any) => t.name?.toLowerCase().includes("exec")) ||
        teams?.[0];

      const teamId = execTeam?.id || "eccb41aa-da47-46f1-90cf-c836f6e640e1";
      const newId = generateId();

      const { data: created, error: insertError } = await supabaseDb
        .from("holdings")
        .insert({
          id: newId,
          team_id: teamId,
          ticker: "CASH",
          name: "Fund Cash Reserve",
          description: "Official JSOSIF operational liquidity & settlement cash reserve",
          industry: "Cash & Equivalents",
          amount_in_shares: 1,
          costCad: cashBalance,
          invest_date: now.slice(0, 10),
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return Response.json({
        success: true,
        cashBalance: Number(created.costCad),
        holdingId: created.id,
        updatedAt: created.updated_at,
      });
    }
  } catch (error) {
    console.error("[portfolio/cash] Update error:", error);
    return Response.json(
      {
        error: "Failed to update cash balance in database",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
