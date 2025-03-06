"use client";
// Main dashboard page, show site analytics and other stuff maybe?
import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
	const [visitors, setVisitors] = useState(null);

	useEffect(() => {
		fetch("/api/analytics")
			.then((res) => res.json())
			.then((data) => setVisitors(data.visitors))
			.catch((err) => console.error("Error fetching analytics:", err));
	}, []);

	return (
		<div>
			<h1>Website Analytics</h1>
			<p>Visitors in the last 30 days: {visitors ?? "Loading..."}</p>
		</div>
	);
}
