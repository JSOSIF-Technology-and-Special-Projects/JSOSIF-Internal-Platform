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
		<html lang="en">
			<body className="antialiased">
				<Header />
				{children}
			</body>
		</html>
	);
}
