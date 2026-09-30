'use client';
import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import jsosifbanner from "../assets/jsosifbanner.png";
import MobileMenu from "./MobileMenu";

const supabase = createClient();

interface Path {
  name: string;
  href: string;
  childPaths?: { name: string; href: string }[];
}

function slugifyTeamName(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Header() {
  const pathname = usePathname();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [teamsDropdownOpen, setTeamsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [paths, setPaths] = useState<Path[]>([]);
  const [teamPaths, setTeamPaths] = useState<{ name: string; href: string }[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && event.target instanceof Node && !dropdownRef.current.contains(event.target)) {
        setTeamsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadTeams() {
      try {
        const res = await fetch("/api/teams");
        if (!res.ok) return;
        const teams = (await res.json()) as Array<{ name: string; teamType: string }>;
        const investmentTeamPaths = teams
          .filter((team) => team.teamType === "Investment")
          .map((team) => ({
            name: team.name,
            href: `/teams/${slugifyTeamName(team.name)}`,
          }));
        setTeamPaths(investmentTeamPaths);
      } catch (error) {
        console.error("Failed to load teams for header navigation:", error);
      }
    }

    void loadTeams();
  }, []);

  // Check user role from active Supabase session.
  useEffect(() => {
  // 1. Initial check
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    updateUserState(session?.user ?? null);
  };

  // 2. Listen for changes (Login, Logout, Token Refresh)
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    updateUserState(session?.user ?? null);
  });

  async function updateUserState(user: any) {
    if (!user) {
      setIsLoggedIn(false);
      setPaths(buildPaths(false, teamPaths));
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const adminRole = (profile?.role ?? "").toLowerCase() === "admin";
    setIsLoggedIn(true);
    setPaths(buildPaths(adminRole, teamPaths));
  }

  checkUser();
  return () => subscription.unsubscribe();
}, [teamPaths]);

  function buildPaths(
    adminRole: boolean,
    dynamicTeamPaths: { name: string; href: string }[]
  ): Path[] {
    return [
      {
        name: "Teams",
        href: "/teams",
        childPaths: dynamicTeamPaths,
      },
      { name: "Portfolio Overview", href: "/portfolio-overview" },
      { name: "Trade Simulator", href: "/simulator" },
      ...(adminRole ? [{ name: "Website Dashboard", href: "/admin-dashboard" }] : []),
      { name: "Learning Resources", href: "/learningresources" },
    ];
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-xl border-b border-slate-200/80 transition-all duration-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      {/* Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 transition-opacity duration-300 ${
          !menuOpen ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 left-0 z-50 transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <MobileMenu
          setMenuOpen={setMenuOpen}
          pathname={pathname}
          paths={paths}
          onLogout={handleLogout}
          isLoggedIn={isLoggedIn}
        />
      </div>

      {/* Main Navigation Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Mobile trigger & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-[#0E5791] hover:bg-slate-100 transition-colors active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>

          <Link href="/homepage" className="flex items-center group">
            <Image
              src={jsosifbanner}
              alt="JSOSIF Logo"
              height={56}
              width={220}
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              priority
            />
          </Link>
        </div>

        {/* Center/Right: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium text-slate-600">
          {paths.map((item) =>
            item.childPaths ? (
              <div key={item.name} className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setTeamsDropdownOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm transition-all duration-150 ${
                    pathname?.startsWith(item.href)
                      ? "bg-blue-50/80 text-[#0E5791] font-semibold"
                      : "hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{item.name}</span>
                  <svg
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      teamsDropdownOpen ? "rotate-180 text-[#0E5791]" : "text-slate-400"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {teamsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/80 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Research Divisions
                    </div>
                    <div className="space-y-0.5 mt-1">
                      <Link
                        href="/teams"
                        onClick={() => setTeamsDropdownOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          pathname === "/teams"
                            ? "bg-blue-50 text-[#0E5791]"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <span>All Investment Teams</span>
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <div className="h-px bg-slate-100 my-1" />
                      {item.childPaths.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={() => setTeamsDropdownOpen(false)}
                          className={`block px-3 py-2 rounded-xl text-xs transition-colors ${
                            pathname === child.href
                              ? "bg-blue-50 text-[#0E5791] font-bold"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3.5 py-2 rounded-xl text-sm transition-all duration-150 ${
                  pathname === item.href
                    ? "bg-blue-50/80 text-[#0E5791] font-semibold"
                    : "hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.name}
              </Link>
            )
          )}
        </nav>

        {/* Right Utilities (Status & Logout) */}
        <div className="flex items-center gap-2.5">
          <span className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Market Active
          </span>

          {isLoggedIn && (
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/70 hover:border-rose-200 transition-all active:scale-95"
            >
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
