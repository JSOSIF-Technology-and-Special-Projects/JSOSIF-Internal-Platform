'use client';
import Link from 'next/link';

export default function TeamsPage() {
  const teams = [
    { name: 'Technology and Healthcare', slug: 'technology-and-healthcare' },
    { name: 'Financial Institutions', slug: 'financial-institutions' },
    { name: 'Tech, Media & Telecommunications', slug: 'tech-media-telecommunications' },
    { name: 'Consumer & Retail', slug: 'consumer-retail' },
    { name: 'Industrials & Natural Resources', slug: 'industrials-natural-resources' },
    { name: 'Health Care', slug: 'health-care' },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-semibold mb-8">Teams</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Link
            key={team.slug}
            href={`/teams/${team.slug}`}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg hover:scale-105 transition-all w-60 h-40 flex items-center justify-center text-center"
          >
            <span className="text-lg font-medium">{team.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
