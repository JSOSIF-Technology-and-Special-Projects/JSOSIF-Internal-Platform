import React from 'react';
import Link from 'next/link';

interface NavigationCardProps {
  title: string;
  description: string;
  href: string;
  badge?: string;
  icon: React.ReactNode;
  openInNewTab?: boolean;
}

interface AnnouncementProps {
  title: string;
  message: string;
  date: string;
  author: string;
  tag?: string;
}

const NavigationCard: React.FC<NavigationCardProps> = ({ title, description, href, badge, icon }) => (
  <Link href={href} className="group block h-full">
    <div className="h-full rounded-3xl bg-white border border-slate-200/80 p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-slate-300/90 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0E5791] via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-blue-50 text-[#0E5791] group-hover:bg-[#0E5791] group-hover:text-white transition-all duration-300 shadow-xs">
            {icon}
          </div>
          {badge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0E5791] border border-blue-100">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0E5791] transition-colors">
          {title}
        </h3>
        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E5791] mt-6 group-hover:gap-2.5 transition-all">
        <span>Open Module</span>
        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </Link>
);

const AnnouncementItem: React.FC<AnnouncementProps> = ({ title, message, date, author, tag = "Notice" }) => (
  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 sm:p-5 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all duration-200">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100/70 text-[#0E5791]">
            {tag}
          </span>
          <h4 className="font-bold text-sm text-slate-900">{title}</h4>
        </div>
        <p className="text-slate-600 text-xs leading-relaxed">{message}</p>
        <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400 font-medium">
          <span>By {author}</span>
          <span>•</span>
          <span>{date}</span>
        </div>
      </div>
      <div className="p-2 rounded-xl bg-blue-50 text-[#0E5791] shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
    </div>
  </div>
);

export default function Homepage() {
  const navigationSections: NavigationCardProps[] = [
    {
      title: "Portfolio Overview",
      description: "Real-time consolidated AUM, S&P 500 benchmark analytics, Alpha progression, and core holdings.",
      href: "/portfolio-overview",
      badge: "Core Fund",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: "Investment Teams",
      description: "Sector-specific investment research divisions, assigned coverage, and division holdings.",
      href: "/teams",
      badge: "Divisions",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: "Trade Simulator",
      description: "Model prospective trades, rebalancing impact, and sector allocation shifts against live quotes.",
      href: "/simulator",
      badge: "Interactive",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: "Website Dashboard",
      description: "Administrative tools, user management, and portal configuration.",
      href: "/admin-dashboard",
      badge: "Admin",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      title: "PDF Parser",
      description: "Automated statement ingestion and trade execution reconciliation parser.",
      href: "/pdf-parser",
      badge: "Utility",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "SharePoint Vault",
      description: "Access official investment pitches, financial models, and research reports.",
      href: "https://uwin365.sharepoint.com/sites/jsosif/Shared%20Documents/Forms/AllItems.aspx",
      badge: "External",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    }
  ];

  const announcements: AnnouncementProps[] = [
    {
      title: "Platform Refresh",
      message: "Internal platform upgraded with real-time portfolio analytics, live Yahoo Finance quotes, and trade simulation.",
      date: "March 2026",
      author: "Platform Engineering",
      tag: "Release"
    },
    {
      title: "Support & Suggestions",
      message: "Any bugs, data questions, or suggestions? Reach out directly to hadrel@uwindsor.ca.",
      date: "March 4th, 2026",
      author: "Landon Hadre",
      tag: "Support"
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Executive Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B2A4A] to-slate-900 text-white p-8 sm:p-10 shadow-xl border border-slate-800/80">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                JSOSIF Internal Operating Platform
              </span>
              <span className="text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
                Odette School of Business
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3">
              John Simpson Odette Student Investment Fund
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Internal research, portfolio management, trade execution simulation, and performance benchmarking for JSOSIF analysts and portfolio managers.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Link
                href="/portfolio-overview"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <span>View Live Portfolio</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                href="/teams"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs backdrop-blur-md border border-white/15 transition-all active:scale-95"
              >
                <span>Explore Research Teams</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bento Grid Navigation */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Platform Modules</h2>
            <span className="text-xs text-slate-500 font-medium">Select a tool or division</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {navigationSections.map((section, index) => (
              <NavigationCard
                key={index}
                title={section.title}
                description={section.description}
                href={section.href}
                badge={section.badge}
                icon={section.icon}
              />
            ))}
          </div>
        </div>

        {/* Announcements & Updates Feed */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Platform Updates & Notices</h2>
              <p className="text-xs text-slate-500 mt-0.5">Fund announcements, operational changes, and system notes</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((announcement, index) => (
              <AnnouncementItem
                key={index}
                title={announcement.title}
                message={announcement.message}
                date={announcement.date}
                author={announcement.author}
                tag={announcement.tag}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
