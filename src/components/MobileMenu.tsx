"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import jsosifbanner from "../assets/jsosifbanner.png";

interface MobileMenuProps {
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  pathname: string | null;
  paths: {
    name: string;
    href: string;
    childPaths?: {
      name: string;
      href: string;
    }[];
  }[];
}

export default function MobileMenu({
  setMenuOpen,
  pathname,
  paths,
}: MobileMenuProps) {
  // State to track which dropdowns are open
  const [openDropdown, setOpenDropdown] = useState<Record<string, boolean>>({});

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div className="h-[100vh] bg-white z-40 min-w-[90vw] sm:min-w-[30rem] shadow-sm border-r relative">
      <div className="flex justify-between items-center p-4 sm:p-12">
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M10.586 12L2.793 4.207l1.414-1.414L12 10.586l7.793-7.793l1.414 1.414L13.414 12l7.793 7.793l-1.414 1.414L12 13.414l-7.793 7.793l-1.414-1.414z"
            />
          </svg>
        </button>
      </div>
      <div className="flex flex-col mt-10">
        <nav className="flex flex-col text-gray-600">
          {/* Home Link */}
          <div className="group">
            <Link href={"/"} passHref legacyBehavior>
              <div className="flex">
                <span
                  onClick={() => setMenuOpen(false)}
                  className={`hover:text-[#0E5791] px-4 sm:px-12 py-1 text-2xl rounded hover:cursor-pointer ${
                    pathname === "/" && "text-primary"
                  }`}
                >
                  Home
                </span>
              </div>
            </Link>
            <div
              className={`h-0.5 my-2 mx-4 transition-all ${
                pathname === "/"
                  ? "bg-[#0E5791] scale-x-100"
                  : "bg-gray-300 group-hover:bg-[#0E5791] duration-300 scale-x-50 group-hover:scale-x-100 opacity-0 group-hover:opacity-100"
              }`}
            />
          </div>

          {/* Other Navigation Links */}
          {paths.map(({ name, href, childPaths }) => {
            if (childPaths && childPaths.length > 0) {
              return (
                <div key={name} className="group">
                  <button
                    onClick={() => toggleDropdown(name)}
                    aria-label={`Toggle ${name} dropdown`}
                    className="flex items-center justify-between hover:text-[#0E5791] px-4 sm:px-12 py-1 text-2xl rounded hover:cursor-pointer w-full"
                  >
                    <span className={`${pathname === href && "text-primary"}`}>
                      {name}
                    </span>
                    <svg
                      className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                        openDropdown[name] ? "rotate-180" : ""
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
                  {openDropdown[name] && (
                    <div className="pl-8">
                      {childPaths.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          passHref
                          legacyBehavior
                        >
                          <a
                            onClick={() => setMenuOpen(false)}
                            className={`block hover:text-[#0E5791] py-1 text-lg rounded hover:cursor-pointer ${
                              pathname === child.href && "text-primary"
                            }`}
                            aria-label={`Navigate to ${child.name}`}
                          >
                            {child.name}
                          </a>
                        </Link>
                      ))}
                    </div>
                  )}
                  <div
                    className={`h-0.5 my-2 mx-4 transition-all ${
                      pathname === href
                        ? "bg-[#0E5791] scale-x-100"
                        : "bg-gray-300 group-hover:bg-[#0E5791] duration-300 scale-x-50 group-hover:scale-x-100 opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </div>
              );
            } else {
              return (
                <div key={name} className="group">
                  <Link href={href} passHref legacyBehavior>
                    <div className="flex">
                      <span
                        onClick={() => setMenuOpen(false)}
                        className={`hover:text-[#0E5791] px-4 sm:px-12 py-1 text-2xl rounded hover:cursor-pointer ${
                          pathname === href && "text-primary"
                        }`}
                      >
                        {name}
                      </span>
                    </div>
                  </Link>
                  <div
                    className={`h-0.5 my-2 mx-4 transition-all ${
                      pathname === href
                        ? "bg-[#0E5791] scale-x-100"
                        : "bg-gray-300 group-hover:bg-[#0E5791] duration-300 scale-x-50 group-hover:scale-x-100 opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </div>
              );
            }
          })}
        </nav>
        <div className="mt-0">
          <Link href="/login" passHref legacyBehavior>
            <a
              onClick={() => setMenuOpen(false)}
              className="hover:text-[#0E5791] px-4 sm:px-12 py-1 text-2xl rounded hover:cursor-pointer text-gray-600"
            >
              Logout
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
