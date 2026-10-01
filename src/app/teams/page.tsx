import Link from "next/link";
import { supabaseDb } from "@/utils/supabaseDb";

export const dynamic = "force-dynamic";

function slugifyTeamName(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function TeamsPage() {
  const { data: rawTeams } = await supabaseDb
    .from("teams")
    .select("id, name, description")
    .eq("team_type", "Investment")
    .order("name", { ascending: true });

  const teams = rawTeams || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0E5791] border border-blue-100">
                JSOSIF Divisions
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {teams.length} Active Research Teams
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Investment Research Divisions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Sector-focused student analyst teams conducting bottom-up fundamental equity research, financial modeling, and asset pitch proposals.
            </p>
          </div>

          <Link
            href="/portfolio-overview"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-[#0E5791] border border-slate-200/70 transition-all self-start sm:self-center active:scale-95"
          >
            <span>Consolidated Portfolio</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Divisions Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${slugifyTeamName(team.name)}`}
              className="group block"
            >
              <div className="h-full rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-slate-300/90 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0E5791] via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0E5791] flex items-center justify-center mb-4 group-hover:bg-[#0E5791] group-hover:text-white transition-all duration-300 shadow-xs">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#0E5791] transition-colors">
                    {team.name}
                  </h2>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed line-clamp-3">
                    {team.description || "Active investment sector coverage, financial analysis, and company valuation pitches."}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E5791] mt-6 group-hover:gap-2.5 transition-all pt-4 border-t border-slate-100">
                  <span>Explore Division</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
