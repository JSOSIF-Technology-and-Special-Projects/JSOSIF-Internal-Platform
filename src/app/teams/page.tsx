import Link from "next/link";
import { prisma } from "@/utils/prisma";

export const dynamic = "force-dynamic";

function slugifyTeamName(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    where: { teamType: "Investment" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, description: true },
  });

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-8 pt-32">
      <h1 className="text-3xl font-semibold mb-8">Teams</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Link
            key={team.id}
            href={`/teams/${slugifyTeamName(team.name)}`}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg hover:scale-105 transition-all w-60 h-40 flex items-center justify-center text-center"
          >
            <span className="text-lg font-medium">{team.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
