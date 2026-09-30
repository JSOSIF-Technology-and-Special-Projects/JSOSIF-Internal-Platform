'use client';

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import jsosifbanner from "../assets/jsosifbanner.png";

interface Path {
  name: string;
  href: string;
  childPaths?: { name: string; href: string }[];
}

interface MobileMenuProps {
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  pathname: string | null;
  paths: Path[];
  onLogout: () => void;
  isLoggedIn: boolean;
}

export default function MobileMenu({ 
  setMenuOpen, 
  pathname, 
  paths, 
  onLogout, 
  isLoggedIn 
}: MobileMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<Record<string, boolean>>({});

  const toggleDropdown = (name: string) => {
    setOpenDropdown(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="h-screen bg-white/95 backdrop-blur-2xl z-50 w-[88vw] max-w-sm shadow-2xl border-r border-slate-200/80 flex flex-col">
      {/* Header section with Logo and Close button */}
      <div className="flex justify-between items-center p-5 border-b border-slate-100 flex-none">
        <Image 
          src={jsosifbanner} 
          alt="JSOSIF Logo" 
          height={60} 
          width={220} 
          className="w-40 object-contain" 
        />
        <button 
          onClick={() => setMenuOpen(false)} 
          aria-label="Close Side Menu" 
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation section - Scrollable */}
      <nav className="flex flex-col flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {paths.map(({ name, href, childPaths }) => (
          <div key={name} className="space-y-1">
            {childPaths && childPaths.length > 0 ? (
              <>
                <button 
                  onClick={() => toggleDropdown(name)} 
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-base font-semibold w-full text-left transition-colors ${
                    pathname?.startsWith(href)
                      ? "bg-blue-50/80 text-[#0E5791]"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{name}</span>
                  <svg 
                    className={`h-4 w-4 transition-transform duration-200 text-slate-400 ${openDropdown[name] ? "rotate-180 text-[#0E5791]" : ""}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown[name] && (
                  <div className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-blue-100 ml-4 my-1">
                    <Link
                      href="/teams"
                      onClick={() => setMenuOpen(false)}
                      className={`block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        pathname === "/teams"
                          ? "bg-blue-50 text-[#0E5791]"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      All Investment Teams
                    </Link>
                    {childPaths.map(child => (
                      <Link 
                        key={child.name} 
                        href={child.href} 
                        onClick={() => setMenuOpen(false)}
                        className={`block px-3 py-2 rounded-xl text-sm transition-colors ${
                          pathname === child.href 
                            ? "bg-blue-50 text-[#0E5791] font-semibold" 
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link 
                href={href} 
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-2xl text-base font-semibold transition-colors ${
                  pathname === href 
                    ? "bg-blue-50/80 text-[#0E5791]" 
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {name}
              </Link>
            )}
          </div>
        ))}

        {/* Logout Button */}
        {isLoggedIn && (
          <div className="pt-6 mt-auto border-t border-slate-100">
            <button
              onClick={() => {
                setMenuOpen(false);
                onLogout();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-600 hover:bg-rose-50 w-full transition-colors active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}