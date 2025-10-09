"use client";
// Header component,

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import jsosifbanner from "../assets/jsosifbanner.png";
import MobileMenu from "./MobileMenu";

export default function Header() {
  // Ensures header stays at the top during scroll
  const pathname = usePathname();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [teamsDropdownOpen, setTeamsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const handleScroll = () => {
    const position = window.scrollY;
    setScrollPosition(position);
  };

  const paths = [
    {
      name: "Teams",
      href: "/teams",
      childPaths: [
        { name: "Technology & Healthcare", href: "/teams/technology-and-healthcare" },
        { name: "Financial Institutions", href: "/teams/financial-institutions" },
        { name: "Tech, Media & Telecommunications", href: "/teams/tech-media-telecommunications" },
        { name: "Consumer & Retail", href: "/teams/consumer-retail" },
        { name: "Industrials & Natural Resources", href: "/teams/industrials-natural-resources" },
        { name: "Health Care", href: "/teams/health-care" },
      ],
    },
    { name: "Website Dashboard", href: "/admin-dashboard" },
    { name: "Learning Resources", href: "/learningresources" },
  ];

  // Adds event listener to listen for scroll events
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && event.target instanceof Node && !dropdownRef.current.contains(event.target)) {
        setTeamsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`flex items-center justify-center py-4 bg-white shadow-md z-50 ${
        scrollPosition > 0 ? "fixed w-full" : "absolute w-full"
      }`}
    >
      <div
        className={`fixed h-screen w-screen top-0 left-0 bg-black z-30 transition-all ${
          !menuOpen
            ? "bg-opacity-0 pointer-events-none"
            : "bg-opacity-20 pointer-events-auto"
        }`}
      />
      <div
        className={`fixed top-0 left-0 z-40 transition-all duration-300 ${
          menuOpen
            ? "translate-x-0"
            : "-translate-x-[90vw] sm:-translate-x-[30rem]"
        }`}
      >
        <MobileMenu 
          setMenuOpen={setMenuOpen}
          pathname={pathname}
          paths={paths}
        />
      </div>
      {/* Logo Section */}
      <div className="mx-4 md:mx-20 xl:mx-52 w-full flex items-center relative overflow-visible">
        <div className="flex items-center flex-none">
          <button
            onClick={() => setMenuOpen(true)}
            aira-label="Back to home"
            className="hover:cursor-pointer mr-4 lg:mr-[8rem] rounded-full p-2 hover:text-[#0E5791] text-gray-600 md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <path fill="currentColor" d="M3 4h18v2H3zm0 7h18v2H3zm0 7h18v2H3z" />
            </svg>
          </button>
          {/* Desktop home button */}
          <div className="hover:cursor-pointer w-fit mr-0 shrink-0">
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:relative sm:left-auto sm:transform-none">
              <Link
                href="/"
                passHref
                legacyBehavior
                aira-labal="Back to home"
                className="hover:cursor-pointer"
              >
                <Image
                  src={jsosifbanner}
                  alt="Logo"
                  height={80}
                  width={300}
                  className="h-12 md:h-16 xl:h-20 object-contain hover:cursor-pointer"
                />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="justify-end md:flex flex-1 space-x-8 text-gray-600 hidden">
          {paths.map(( item ) => {
            if(item.childPaths){
              return (
                <div key={item.name} className="relative" ref={dropdownRef}>
                  <button onClick={() => 
                    setTeamsDropdownOpen((prev) => !prev)
                  }
                  className={`flex items-center justify-between hover:text-[#0E5791] hover:cursor-pointer ${
                    pathname === item.href ? "text-primary" : ""
                  }`}
                  aria-label={`Toggle ${item.name} dropdown`}
                  >
                    <span>{item.name}</span>
                    <svg
                      className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                        teamsDropdownOpen ? "rotate-180" : ""
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {teamsDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md border border-gray-300">
                      {item.childPaths.map((child) =>
                        <Link
                          key={child.name}
                          href={child.href}
                          passHref
                          legacyBehavior
                        >
                          <a
                            className="block px-4 py-2 hover:text-[#0E5791] hover:cursor-pointer"
                            aria-label={`Navigate to ${child.name}`}
                          >
                            {child.name}
                          </a>
                        </Link>
                      
                      )}
                    </div>
                  )}
                </div>
              );
            } else{
              return (
                <Link
                  href={item.href}
                  passHref
                  legacyBehavior
                  key={item.name}
                  aria-label={`Navigate to ${item.name}`}
                  className={"hover:cursor-pointer"}
                >
                  <a
                    aira-disabled="true"
                    className={`hover:text-[#0E5791] hover:cursor-pointer ${
                      pathname === item.href && "text-primary"
                    }`}
                  >
                    {item.name}
                  </a>
                </Link>
              );
            }
          })}
        </nav>
        {/* Logout SVG */}
        {/* <div className="absolute top-6 -right-[6rem] z-50"> */}
          <Link
            href = "/login"
            passHref
            legacyBehavior
          >
            <a aria-label = "Logout" title="Logout" className = "ml-auto transform translate-x-12 hover:cursor">
              <svg className="text-gray-600 hover:text-[#0E5791]" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                  <path d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2" />
                  <path d="M9 12h12l-3-3m0 6l3-3" />
                </g>
              </svg>
            </a>
          </Link>
        {/* </div> */}
        {/* {!isLoggedIn && ( 
          <div className="hidden xl:flex space-x-2 absolute top-[-0.5rem] right-[-11rem]">
            <Link href="/login" legacyBehavior>
              <button className="bg-white border border-gray-300 text-sm px-4 py-1 rounded-md hover:bg-gray-100 hover:border-gray-400">
                Log in
              </button>
            </Link>
            <Link href="/signup">
              <button className="bg-[#0E5791] text-white text-sm px-4 py-1 rounded-md hover:bg-gray-800">
                Sign Up
              </button>
            </Link>
          </div>
        )} */}
      </div>
    </header>
  );
}

