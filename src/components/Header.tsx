'use client';
import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import jsosifbanner from "../assets/jsosifbanner.png";
import MobileMenu from "./MobileMenu";

interface Path {
  name: string;
  href: string;
  childPaths?: { name: string; href: string }[];
}

export default function Header() {
  const pathname = usePathname();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [teamsDropdownOpen, setTeamsDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [paths, setPaths] = useState<Path[]>([]);
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

  // Check user role from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setIsLoggedIn(true);
      const adminRole = user.role?.toLowerCase() === "admin";
      setIsAdmin(adminRole);

      // Build paths based on role
      const newPaths: Path[] = [
        {
          name: "Teams",
          href: "/teams",
          childPaths: [
            { name: "Fixed Income and Real Estate", href: "/teams/fixed-income-real-estate" },
            { name: "Financial Institutions", href: "/teams/financial-institutions" },
            { name: "Tech, Media & Telecommunications", href: "/teams/tech-media-telecommunications" },
            { name: "Consumer & Retail", href: "/teams/consumer-retail" },
            { name: "Industrials & Natural Resources", href: "/teams/industrials-natural-resources" },
            { name: "Health Care", href: "/teams/health-care" },
          ],
        },
        ...(adminRole ? [{ name: "Website Dashboard", href: "/admin-dashboard" }] : []),
        { name: "Learning Resources", href: "/learningresources" },
      ];

      setPaths(newPaths);
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);

      // Only non-admin paths
      setPaths([
        {
          name: "Teams",
          href: "/teams",
          childPaths: [
            { name: "Fixed Income and Real Estate", href: "/teams/fixed-income-real-estate" },
            { name: "Financial Institutions", href: "/teams/financial-institutions" },
            { name: "Tech, Media & Telecommunications", href: "/teams/tech-media-telecommunications" },
            { name: "Consumer & Retail", href: "/teams/consumer-retail" },
            { name: "Industrials & Natural Resources", href: "/teams/industrials-natural-resources" },
            { name: "Health Care", href: "/teams/health-care" },
          ],
        },
        { name: "Learning Resources", href: "/learningresources" },
      ]);
    }
  }, []);

  if (pathname === "/login") return null;

  return (
    <header className={`flex items-center justify-center py-4 bg-white shadow-md z-50 ${scrollPosition > 0 ? "fixed w-full" : "absolute w-full"}`}>
      <div className={`fixed h-screen w-screen top-0 left-0 bg-black z-30 transition-all ${!menuOpen ? "bg-opacity-0 pointer-events-none" : "bg-opacity-20 pointer-events-auto"}`} />
      <div className={`fixed top-0 left-0 z-40 transition-all duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-[90vw] sm:-translate-x-[30rem]"}`}>
        <MobileMenu setMenuOpen={setMenuOpen} pathname={pathname} paths={paths} />
      </div>

      {/* Logo */}
      <div className="mx-4 md:mx-20 xl:mx-52 w-full flex items-center relative overflow-visible">
        <div className="flex items-center flex-none">
          <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="hover:cursor-pointer mr-4 lg:mr-[8rem] rounded-full p-2 hover:text-[#0E5791] text-gray-600 md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M3 4h18v2H3zm0 7h18v2H3zm0 7h18v2H3z" /></svg>
          </button>
          <Link href="/homepage">
            <Image src={jsosifbanner} alt="Logo" height={80} width={300} className="h-12 md:h-16 xl:h-20 object-contain hover:cursor-pointer" />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="justify-end md:flex flex-1 space-x-8 text-gray-600 hidden">
          {paths.map(item => item.childPaths ? (
            <div key={item.name} className="relative" ref={dropdownRef}>
              <button onClick={() => setTeamsDropdownOpen(prev => !prev)} className={`flex items-center justify-between hover:text-[#0E5791] ${pathname === item.href ? "text-primary" : ""}`}>
                <span>{item.name}</span>
                <svg className={`ml-1 h-4 w-4 transition-transform duration-200 ${teamsDropdownOpen ? "rotate-180" : ""}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {teamsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md border border-gray-300">
                  {item.childPaths.map(child => (
                    <Link key={child.name} href={child.href} className="block px-4 py-2 hover:text-[#0E5791]">{child.name}</Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link key={item.name} href={item.href} className={`hover:text-[#0E5791] ${pathname === item.href ? "text-primary" : ""}`}>{item.name}</Link>
          ))}
        </nav>

        {/* Logout */}
        {isLoggedIn && (
          <Link href="/login" className="ml-auto transform translate-x-12 hover:cursor-pointer">
            <svg className="text-gray-600 hover:text-[#0E5791]" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <path d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2" />
                <path d="M9 12h12l-3-3m0 6l3-3" />
              </g>
            </svg>
          </Link>
        )}
      </div>
    </header>
  );
}
