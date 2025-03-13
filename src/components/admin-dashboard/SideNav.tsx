import React from "react";
import Link from "next/link";

export default function SideNav() {
	const links = [
		{
			name: "Dashboard",
			href: "/admin-dashboard",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
				>
					<path
						fill="none"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm0 5h18M10 3v18"
					/>
				</svg>
			),
		},
		{
			name: "Members",
			href: "/admin-dashboard/members",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
				>
					<path
						fill="none"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2m1-17.87a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85"
					/>
				</svg>
			),
		},
		{
			name: "Teams",
			href: "/admin-dashboard/teams",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
				>
					<path
						fill="none"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0-4 0m-2 8v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1M15 5a2 2 0 1 0 4 0a2 2 0 0 0-4 0m2 5h2a2 2 0 0 1 2 2v1M5 5a2 2 0 1 0 4 0a2 2 0 0 0-4 0m-2 8v-1a2 2 0 0 1 2-2h2"
					/>
				</svg>
			),
		},
		{
			name: "Investment Divisions",
			href: "/admin-dashboard/investment-divisions",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
				>
					<path
						fill="none"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M4 19h16M4 15l4-6l4 2l4-5l4 4"
					/>
				</svg>
			),
		},
		{
			name: "Support Teams",
			href: "/admin-dashboard/support-teams",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
				>
					<g
						fill="none"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
					>
						<path d="M3 3v18h18" />
						<path d="M7 15a2 2 0 1 0 4 0a2 2 0 1 0-4 0m4-10a2 2 0 1 0 4 0a2 2 0 1 0-4 0m5 7a2 2 0 1 0 4 0a2 2 0 1 0-4 0m5-9l-6 1.5m-.887 2.15l2.771 3.695M16 12.5l-5 2" />
					</g>
				</svg>
			),
		},
		{
			name: "Portfolio",
			href: "/admin-dashboard/portfolio",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
				>
					<g
						fill="none"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
					>
						<path d="M10 3.2A9 9 0 1 0 20.8 14a1 1 0 0 0-1-1H13a2 2 0 0 1-2-2V4a.9.9 0 0 0-1-.8" />
						<path d="M15 3.5A9 9 0 0 1 20.5 9H16a1 1 0 0 1-1-1z" />
					</g>
				</svg>
			),
		},
		{
			name: "Alumni",
			href: "/admin-dashboard/alumni",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
				>
					<g
						fill="none"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
					>
						<path d="M22 9L12 5L2 9l10 4zv6" />
						<path d="M6 10.6V16a6 3 0 0 0 12 0v-5.4" />
					</g>
				</svg>
			),
		},
	];

	return (
		<div>
			<div className="flex flex-col bg-white border-r p-10 w-[20rem] gap-6 h-full min-h-screen">
				{links.map((link) => (
					<Link href={link.href} key={link.name}>
						<div className="flex gap-4 items-center shrink-0">
							{link?.icon && link.icon}
							<p className="text-xl font-medium text-nowrap">
								{link.name}
							</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
