"use client";
// Main dashboard page, show site analytics and other stuff maybe?
import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
	const [visitors, setVisitors] = useState(null);
	const [userName, setUserName] = useState<string | null>(null);

	useEffect(() => {
		fetch("/api/analytics")
			.then((res) => res.json())
			.then((data) => setVisitors(data.visitors))
			.catch((err) => console.error("Error fetching analytics:", err));
			const storedUser = localStorage.getItem("user");
			if (storedUser) {
			  const user = JSON.parse(storedUser);
			  setUserName(user.name); // assuming user object has a 'name' property
			}
		}, []);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
		<h1 className="text-3xl mb-8">Hello, {userName ?? "User"}!</h1>
		<h2 className="text-xl mb-4">Website Analytics</h2>
		<p>Visitors in the last 30 days: {visitors ?? "Loading..."}</p>
		</div>
	);
}
