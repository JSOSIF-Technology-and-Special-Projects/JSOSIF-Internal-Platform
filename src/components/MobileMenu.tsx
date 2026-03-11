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
    <div className="h-screen bg-white z-40 min-w-[90vw] sm:min-w-[30rem] shadow-sm border-r flex flex-col">
      {/* Header section with Logo and Close button */}
      <div className="flex justify-between items-center p-4 sm:p-12 flex-none">
        <Image 
          src={jsosifbanner} 
          alt="Logo" 
          height={80} 
          width={300} 
          className="w-52 object-contain" 
        />
        <button 
          onClick={() => setMenuOpen(false)} 
          aria-label="Close Side Menu" 
          className="p-2 rounded-full hover:text-[#0E5791] text-gray-600 active:scale-95 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M10.586 12L2.793 4.207l1.414-1.414L12 10.586l7.793-7.793l1.414 1.414L13.414 12l7.793 7.793l-1.414 1.414L12 13.414l-7.793 7.793l-1.414-1.414z"/>
          </svg>
        </button>
      </div>

      {/* Navigation section - Scrollable */}
      <nav className="flex flex-col flex-1 overflow-y-auto text-gray-600 pb-10">
        <div className="mt-4">
          {paths.map(({ name, href, childPaths }) => (
            <div key={name} className="group">
              {childPaths && childPaths.length > 0 ? (
                <>
                  <button 
                    onClick={() => toggleDropdown(name)} 
                    className="flex items-center justify-between px-4 sm:px-12 py-3 text-2xl rounded hover:text-[#0E5791] w-full text-left"
                  >
                    <span className={`${pathname === href ? "text-[#0E5791] font-semibold" : ""}`}>{name}</span>
                    <svg 
                      className={`ml-2 h-5 w-5 transition-transform duration-200 ${openDropdown[name] ? "rotate-180" : ""}`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown[name] && (
                    <div className="pl-8 bg-gray-50 border-y border-gray-100">
                      {childPaths.map(child => (
                        <Link key={child.name} href={child.href} onClick={() => setMenuOpen(false)}>
                          <span className={`block px-4 sm:px-12 py-2 text-lg hover:text-[#0E5791] ${pathname === child.href ? "text-[#0E5791] font-medium" : ""}`}>
                            {child.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link href={href} onClick={() => setMenuOpen(false)}>
                  <span className={`block px-4 sm:px-12 py-3 text-2xl rounded hover:text-[#0E5791] ${pathname === href ? "text-[#0E5791] font-semibold" : ""}`}>
                    {name}
                  </span>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Logout Button - Only visible when logged in */}
        {isLoggedIn && (
          <div className="mt-auto pt-4">
            <button
              onClick={() => {
                setMenuOpen(false);
                onLogout();
              }}
              className="flex items-center gap-3 px-4 sm:px-12 py-6 text-left text-2xl font-semibold text-red-600 hover:bg-red-50 w-full transition-colors border-t border-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2m5-4l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}