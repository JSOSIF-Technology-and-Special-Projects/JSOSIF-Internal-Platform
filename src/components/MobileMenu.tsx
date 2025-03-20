import React from "react";
import Image from "next/image";
import Link from "next/link";
import jsosifbanner from "../assets/jsosifbanner.png";

interface MobileMenuProps {
	setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
	pathname: string | null;
	paths: {
		name: string;
		href: string;
	}[];
}
export default function MobileMenu({
	setMenuOpen,
	pathname,
	paths,
}: MobileMenuProps) {
	return (
		<>
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
					{/* Navigation Links */}
					<nav className="flex flex-col text-gray-600">
						<div className="group">
							<Link
								href={"/"}
								passHref
								legacyBehavior
								aria-label="Navigate to Home"
							>
								<div className="flex">
									{/* <div
										className={`border-r-4 border-l border-primary rounded-r-md ${
											pathname !== "/"
												? "-translate-x-full group-hover:translate-x-0"
												: "translate-x-0"
										} transition-all`}
									/> */}
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

						{paths.map(({ name, href }) => {
							return (
								<div key={name} className="group">
									<Link
										href={href}
										passHref
										legacyBehavior
										key={name}
										aria-label={`Navigate to ${name}`}
									>
										<div className="flex">
											{/* <div
												className={`border-r-4 border-l border-primary rounded-r-md ${
													pathname !== href
														? "-translate-x-full group-hover:translate-x-0"
														: "translate-x-0"
												} transition-all`}
												key={name}
											/> */}
											<span
												onClick={() =>
													setMenuOpen(false)
												}
												className={`hover:text-[#0E5791] px-4 sm:px-12 py-1 text-2xl rounded hover:cursor-pointer ${
													pathname === href &&
													"text-primary"
												}`}
											>
												{name}
											</span>
										</div>
									</Link>
									{/* {i !== paths.length - 1 && ( */}
									<div
										key={name + "divider"}
										className={`h-0.5 my-2 mx-4 transition-all ${
											pathname === href
												? "bg-[#0E5791] scale-x-100"
												: "bg-gray-300 group-hover:bg-[#0E5791] duration-300 scale-x-50 group-hover:scale-x-100 opacity-0 group-hover:opacity-100"
										}`}
									/>
									{/* )} */}
								</div>
							);
						})}
					</nav>
				</div>
			</div>
		</>
	);
}
