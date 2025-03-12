import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import fs from "fs";
import path from "path";

// Define response structure
export interface AnalyticsResponse {
	activeUsers: number;
	newUsers: number;
	sessions: number;
	pageViews: number;
	avgSessionDuration: number;
	bounceRate: number;
}

// Load Google credentials
const GOOGLE_ANALYTICS_CREDS = process.env.GOOGLE_ANALYTICS_CREDS;
if (!GOOGLE_ANALYTICS_CREDS) {
	throw new Error("GOOGLE_ANALYTICS_CREDS is not defined");
}

// Ensure correct path handling
const credentials = JSON.parse(
	fs.readFileSync(path.resolve(GOOGLE_ANALYTICS_CREDS), "utf-8")
);

// Initialize Google Analytics API client
const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
if (!GA4_PROPERTY_ID) {
	throw new Error("GA4_PROPERTY_ID is not defined");
}

export async function GET(): Promise<
	NextResponse<AnalyticsResponse | { error: string }>
> {
	try {
		const [response] = await analyticsDataClient.runReport({
			property: `properties/${GA4_PROPERTY_ID}`,
			dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
			metrics: [
				{ name: "activeUsers" },
				{ name: "newUsers" },
				{ name: "sessions" },
				{ name: "screenPageViews" },
				{ name: "averageSessionDuration" },
				{ name: "bounceRate" },
			],
		});

		console.log(response);

		if (
			!response ||
			!response?.rows ||
			response.rows.length === 0 ||
			!response.rows[0].metricValues
		) {
			return NextResponse.json(
				{ error: "No data available" },
				{ status: 404 }
			);
		}

		// Extract metric values safely
		const metricsData = response.rows[0].metricValues.map(
			(value) => parseFloat(value.value || "") || 0
		);

		console.log(metricsData);

		const analyticsData: AnalyticsResponse = {
			activeUsers: metricsData[0] ?? 0,
			newUsers: metricsData[1] ?? 0,
			sessions: metricsData[2] ?? 0,
			pageViews: metricsData[3] ?? 0,
			avgSessionDuration: metricsData[4] ?? 0,
			bounceRate: metricsData[5] ?? 0,
		};

		return NextResponse.json(analyticsData);
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 500 }
		);
	}
}
