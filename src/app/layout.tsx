import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";


const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "JSOSIF Platform | Internal Fund Dashboard",
	description: "Odette School of Business - John Simpson Odette Student Investment Fund Internal Dashboard",
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
