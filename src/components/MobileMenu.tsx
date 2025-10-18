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
}

export default function MobileMenu({ setMenuOpen, pathname, paths }: MobileMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<Record<string, boolean>>({});

  const toggleDropdown = (name: string) => {
    setOpenDropdown(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="h-[100vh] bg-white z-40 min-w-[90vw] sm:min-w-[30rem] shadow-sm border-r relative">
      <div className="flex justify-between items-center p-4 sm:p-12">
        <Image src={jsosifbanner} alt="Logo" height={80} width={300} className="w-52 object-contain" />
        <button onClick={() => setMenuOpen(false)} aria-label="Close Side Menu" className="p-2 rounded-full hover:text-[#0E5791] text-gray-600 active:scale-95 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M10.586 12L2.793 4.207l1.414-1.414L12 10.586l7.793-7.793l1.414 1.414L13.414 12l7.793 7.793l-1.414 1.414L12 13.414l-7.793 7.793l-1.414-1.414z"/>
          </svg>
        </button>
      </div>

      <nav className="flex flex-col mt-10 text-gray-600">
        {paths.map(({ name, href, childPaths }) => (
          <div key={name} className="group">
            {childPaths && childPaths.length > 0 ? (
              <>
                <button onClick={() => toggleDropdown(name)} className="flex items-center justify-between px-4 sm:px-12 py-1 text-2xl rounded hover:text-[#0E5791] w-full">
                  <span className={`${pathname === href ? "text-primary" : ""}`}>{name}</span>
                  <svg className={`ml-1 h-4 w-4 transition-transform duration-200 ${openDropdown[name] ? "rotate-180" : ""}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown[name] && (
                  <div className="pl-8">
                    {childPaths.map(child => (
                      <Link key={child.name} href={child.href}>
                        <span onClick={() => setMenuOpen(false)} className={`block py-1 text-lg hover:text-[#0E5791] ${pathname === child.href ? "text-primary" : ""}`}>{child.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link href={href}>
                <span onClick={() => setMenuOpen(false)} className={`block px-4 sm:px-12 py-1 text-2xl rounded hover:text-[#0E5791] ${pathname === href ? "text-primary" : ""}`}>{name}</span>
              </Link>
            )}
          </div>
        ))}

        {/* Logout */}
        <Link href="/login">
          <span onClick={() => setMenuOpen(false)} className="px-4 sm:px-12 py-1 text-2xl rounded hover:text-[#0E5791] text-gray-600 mt-4">Logout</span>
        </Link>
      </nav>
    </div>
  );
}
