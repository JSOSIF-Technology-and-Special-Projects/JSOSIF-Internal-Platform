"use client";
// Main dashboard page, show site analytics and other stuff maybe?
import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
	const [userName, setUserName] = useState<string | null>(null);

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			const user = JSON.parse(storedUser);
			setUserName(user.name);
		}
	}, []);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
		<h1 className="text-3xl mb-8">Hello, {userName ?? "User"}!</h1>
		<h2 className="text-xl mb-4">Website Analytics</h2>
		<p>Analytics functionality has been removed.</p>
		</div>
	);
}
