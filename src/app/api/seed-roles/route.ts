import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        message: "Supabase environment variables are not configured",
      },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // 1. FILL IN THE EMAILS HERE
  // Leave the email as "" if you don't want to create an account for that person yet.
  const membersData = [
    { dbId: "11111111-2222-3333-4444-000000000002", name: "Sean Clarke", email: "clarke74@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000003", name: "Nolan Robinson", email: "robins35@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000004", name: "Cozy Cosentino", email: "cosentie@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000006", name: "Noah Di Maio", email: "dimaion@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000007", name: "Rafael Silva", email: "ferrei42@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000008", name: "Joseph Murtagh", email: "murtaghj@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000009", name: "Cullan Byrne", email: "byrne91@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000010", name: "Nick Mbugua", email: "mbuguan@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000011", name: "Luckshsan Uthayakumar", email: "uthayakl@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000012", name: "Kohen Colenutt", email: "colenutk@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000013", name: "Robby Alionte", email: "alionter@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000014", name: "Jack Marcotte", email: "marcott2@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000015", name: "Linda Nguyen", email: "nguyen9a@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000016", name: "Ryan Perin", email: "perinr@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000017", name: "Jacob Rosenberg", email: "rosenbej@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000018", name: "Joel Preston", email: "preston9@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000019", name: "Maia Naccarato", email: "naccara5@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000020", name: "Matthew Tracey", email: "tracey91@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000021", name: "Edward Dragomir", email: "dragomi3@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000022", name: "Zarek Ting", email: "tingz@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000023", name: "Dante Boccarossa", email: "boccaro@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000024", name: "Anthony Vanier", email: "vanier4@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000025", name: "Kate Salter", email: "salter5@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000026", name: "Izzy Kekelj", email: "kekelji@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000027", name: "Travis Loughead", email: "loughea@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000028", name: "Claire Patterson", email: "patter12@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000029", name: "Andrew Booth", email: "booth12@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000030", name: "Mariam Bakmaya", email: "bakmaya@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000031", name: "Weiai Luo", email: "luo9a@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000032", name: "Ethan Braga", email: "braga1@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000033", name: "Houshang Javan", email: "javan@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000034", name: "Nathan Kemp-Dove", email: "kempdov@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000035", name: "Julian Kohut", email: "kohut3@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000036", name: "Lucas Way", email: "way6@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000037", name: "Matthew Livingstone", email: "livings8@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000038", name: "Michael Berlingieri", email: "berlingm@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000039", name: "Elizibeth Spiridon", email: "spiridoe@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000040", name: "Kailyana Gelinas", email: "gelinas5@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000041", name: "Sloan Yack", email: "yack1@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000042", name: "Ahmed Nayab", email: "nayab@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000043", name: "Aidan Richer", email: "richer2@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000044", name: "Max Mullins", email: "mullin71@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000046", name: "Edesiri Opara", email: "opara2@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000047", name: "Michael Gibb", email: "gibbm@uwindsor.ca" }, // <-- Example format
    { dbId: "11111111-2222-3333-4444-000000000048", name: "Landon Hadre", email: "hadrel@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000049", name: "Anthony Komini", email: "kominia@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000050", name: "Kevin Neave", email: "neavek@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000051", name: "Nabiha Mahboob", email: "mahboobn@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000052", name: "Sagal Rirash", email: "rirashs@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000053", name: "Joelle Jawdat", email: "jawdatj@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000054", name: "Hanna Jasey", email: "jaseyh@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000055", name: "Zeinab Kalakech", email: "kalakecz@uwindsor.ca" },
    { dbId: "11111111-2222-3333-4444-000000000056", name: "Natalie Maxwell-Labute", email: "maxwel51@uwindsor.ca" },
  ];

  const results = [];
  const defaultPassword = "Jsosif2026"; // The password everyone will use to log in the first time

  for (const member of membersData) {
    // Skip if no email is provided
    if (!member.email || member.email.trim() === "") continue;

    try {
      // 1. Create the Auth User
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: member.email,
        password: defaultPassword,
        email_confirm: true, // Auto-verifies their email
      });

      if (authError) throw new Error(`Auth Error: ${authError.message}`);
      if (!authData.user) throw new Error("No user returned from Supabase Auth");

      const authUserId = authData.user.id;

      // 2. Add them to your "profiles" table (so they get the 'User' role)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({ id: authUserId, role: 'User' });

      if (profileError) throw new Error(`Profile Error: ${profileError.message}`);

      // 3. Link the Auth ID to your "members" table
      const { error: memberError } = await supabaseAdmin
        .from('members')
        .update({ user_id: authUserId })
        .eq('id', member.dbId);

      if (memberError) throw new Error(`Member Update Error: ${memberError.message}`);

      results.push({ name: member.name, status: "Success", authId: authUserId });
    } catch (error: unknown) {
      results.push({
        name: member.name,
        status: "Failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    message: "Bulk creation finished!",
    totalProcessed: results.length,
    results
  });
}
