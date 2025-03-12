"use client";
// Header component,

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import jsosifbanner from "../assets/jsosifbanner.png";

export default function Header() {
	// Ensures header stays at the top during scroll
	const pathname = usePathname();
	const [scrollPosition, setScrollPosition] = useState(0);
	const [menuOpen, setMenuOpen] = useState(false);
	const handleScroll = () => {
		const position = window.scrollY;
		setScrollPosition(position);
	};

	const paths = [
		{
			name: "Home",
			href: "/home",
		},
		{
			name: "Learning Resources",
			href: "/learningresources",
		},
		{
			name: "Teams",
			href: "/teams",
			childPaths: [
				{
					name: "Placeholder1",
					href: "/placholder1",
				},
				{
					name: "Placeholder2",
					href: "/placholder2",
				},
			],
		},
	];

	// Adds event listener to listen for scroll events
	useEffect(() => {
		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
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
			></div>
			<div>
				<button
					onClick={() => setMenuOpen(true)}
					aira-label="Back to home"
					className="hover:cursor-pointer mr-4 lg:mr-[8rem] rounded-full p-2 hover:text-[#0E5791] text-gray-600 xl:hidden"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 24 24"
					>
						<path
							fill="currentColor"
							d="M3 4h18v2H3zm0 7h18v2H3z"
						/>
					</svg>
				</button>
				<div>
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
				<nav className="xl:flex space-x-8 text-gray-600 hidden">
					{paths.map(({ name, href }) => {
						return (
							<Link
								href={href}
								passHref
								legacyBehavior
								key={name}
								aria-label={`Navigate to ${name}`}
								className={"hover:cursor-pointer"}
							>
								<a
									aira-disabled="true"
									className={`hover:text-[#0E5791] hover:cursor-pointer ${
										pathname === href && "text-primary"
									}`}
								>
									{name}
								</a>
							</Link>
						);
					})}
				</nav>
			</div>
		</header>
	);
}
