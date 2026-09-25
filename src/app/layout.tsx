import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
	title: "JSOSIF Internal",
	description: "Internal tools for JSOSIF",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="h-full">
			<body
				className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-[#F8FAFC] text-slate-900 min-h-full flex flex-col selection:bg-blue-100 selection:text-blue-900`}
			>
				<Header />
				<div className="flex-1">
					{children}
				</div>
			</body>
		</html>
	);
}
