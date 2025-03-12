"use client";
// Main dashboard page, show site analytics and other stuff maybe?
import React, { useEffect, useState } from "react";
import { AnalyticsResponse } from "@/app/api/analytics/route";

export default function AdminDashboard() {
	const [webAnalytics, setWebAnalytics] = useState<
		AnalyticsResponse | undefined
	>();

	useEffect(() => {
		fetch("/api/analytics")
			.then((res) => res.json())
			.then((data) => setWebAnalytics(data))
			.catch((err) => console.error("Error fetching analytics:", err));
	}, []);

	useEffect(() => {
		console.log(webAnalytics);
	}, [webAnalytics]);

	function formatDuration(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes}m ${remainingSeconds}s`;
	}

	return (
		<div className="py-10 px-6">
			<div className="flex flex-col w-full gap-10">
				<h1 className="text-6xl font-semibold">
					<span className="text-primary">JSOSIF</span> Website Admin
					App
				</h1>
				<div className="w-full border-2 border-primary" />
				<div>
					<p className="text-lg italic">
						Welcome to the admin dashboard! Here you can manage all
						aspects of the website.
					</p>
				</div>
				<div className="flex flex-col gap-4">
					<h1 className="text-4xl italic font-medium">
						Website Analytics
					</h1>
					<div className="border w-full p-4 rounded-xl grid grid-cols-3 gap-4">
						{/* Analytics Cards */}

						{/* Active Users */}
						<div className="flex flex-col gap-2">
							<p className="text-sm text-gray-500 underline-offset-4 underline">
								Active users in the last 30 days
							</p>
							<div>
								{webAnalytics?.activeUsers ? (
									<span className="text-6xl text-success">
										{webAnalytics.activeUsers}
									</span>
								) : (
									<div className="pt-2">
										<div
											className="inline-block h-12 w-12 animate-spin rounded-full border-[6px] border-solid border-success border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
											role="status"
										>
											<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
												Loading...
											</span>
										</div>
									</div>
								)}
							</div>
						</div>
						{/* New Users */}
						<div className="flex flex-col gap-2">
							<p className="text-sm text-gray-500 underline-offset-4 underline">
								New users in the last 30 days
							</p>
							<div>
								{webAnalytics?.activeUsers ? (
									<span className="text-6xl text-success">
										{webAnalytics.newUsers}
									</span>
								) : (
									<div className="pt-2">
										<div
											className="inline-block h-12 w-12 animate-spin rounded-full border-[6px] border-solid border-success border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
											role="status"
										>
											<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
												Loading...
											</span>
										</div>
									</div>
								)}
							</div>
						</div>
						{/* Bounce Rate */}
						<div className="flex flex-col gap-2">
							<p className="text-sm text-gray-500 underline-offset-4 underline">
								User bounce rate
							</p>
							<div>
								{webAnalytics?.activeUsers ? (
									<span className="text-6xl text-success">
										{(
											webAnalytics.bounceRate * 100
										).toFixed(1)}
										%
									</span>
								) : (
									<div className="pt-2">
										<div
											className="inline-block h-12 w-12 animate-spin rounded-full border-[6px] border-solid border-success border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
											role="status"
										>
											<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
												Loading...
											</span>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* <div className="col-span-3 border border-base-300" /> */}
						<hr className="col-span-3 py-4" />

						{/* Average Session Duration */}
						<div className="flex flex-col gap-2">
							<p className="text-sm text-gray-500 underline-offset-4 underline">
								Total sessions in the last 30 days
							</p>
							<div>
								{webAnalytics?.activeUsers ? (
									<span className="text-6xl text-success">
										{webAnalytics.sessions}
									</span>
								) : (
									<div className="pt-2">
										<div
											className="inline-block h-12 w-12 animate-spin rounded-full border-[6px] border-solid border-success border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
											role="status"
										>
											<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
												Loading...
											</span>
										</div>
									</div>
								)}
							</div>
						</div>
						{/* Total Sessions */}
						<div className="flex flex-col gap-2">
							<p className="text-sm text-gray-500 underline-offset-4 underline">
								Average Session Duration
							</p>
							<div>
								{webAnalytics?.activeUsers ? (
									<span className="text-6xl text-success">
										{formatDuration(
											webAnalytics.avgSessionDuration
										)}
									</span>
								) : (
									<div className="pt-2">
										<div
											className="inline-block h-12 w-12 animate-spin rounded-full border-[6px] border-solid border-success border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
											role="status"
										>
											<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
												Loading...
											</span>
										</div>
									</div>
								)}
							</div>
						</div>
						{/* Page Views */}
						<div className="flex flex-col gap-2">
							<p className="text-sm text-gray-500 underline-offset-4 underline">
								Total Page Views
							</p>
							<div>
								{webAnalytics?.activeUsers ? (
									<span className="text-6xl text-success">
										{webAnalytics.pageViews}
									</span>
								) : (
									<div className="pt-2">
										<div
											className="inline-block h-12 w-12 animate-spin rounded-full border-[6px] border-solid border-success border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
											role="status"
										>
											<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
												Loading...
											</span>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
