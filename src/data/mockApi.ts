import healthCare from "@/assets/healthcare.avif";
import techMediaTelecom from "@/assets/techmediatelecom.jpg";
import consumerRetail from "@/assets/consumerretail.avif";
import industrialsNaturalResources from "@/assets/industrialsresources.webp";
import fixedIncomeRealEstate from "@/assets/incomerealestate.webp";
import financial from "@/assets/financial.avif";

export const mockApiData = {
	statistics: {
		fundMembers: 51,
		investmentHoldings: 30,
		assetsUnderManagement: 261000,
	},
	investmentDivisions: [
		// {
		// 	slug: "technology-and-healthcare",
		// 	name: "Technology and Healthcare",
		// 	description:
		// 		"Combined technology and healthcare investment division focusing on innovation and growth opportunities.",
		// 	tickers: "MGOL|12M,LTRY|12M,NVDA|12M,F|12M",
		// 	value: 25000,
		// 	return: 15,
		// 	sp500Return: -5,
		// 	portfolioComposition: [
		// 		{ symbol: "MGOL", name: "MGO Global Inc.", percentage: 35, color: "#FF6B6B" },
		// 		{ symbol: "LTRY", name: "Lottery.com Inc.", percentage: 25, color: "#4ECDC4" },
		// 		{ symbol: "NVDA", name: "NVIDIA Corporation", percentage: 30, color: "#45B7D1" },
		// 		{ symbol: "F", name: "Ford Motor Company", percentage: 10, color: "#96CEB4" }
		// 	],
		// 	holdings: [
		// 		{ symbol: "MGOL", name: "MGO Global Inc.", price: 0.1693, change: 0.0303, changePercent: 3.15, volume: 315155155 },
		// 		{ symbol: "LTRY", name: "Lottery.com Inc.", price: 1.4699, change: 0.98, changePercent: 22.64, volume: 463757 },
		// 		{ symbol: "NVDA", name: "NVIDIA Corporation", price: 127.4499, change: 2.6199, changePercent: 26.19, volume: 188811275 },
		// 		{ symbol: "F", name: "Ford Motor Company", price: 9.35, change: -0.66, changePercent: -6.6, volume: 167836690 }
		// 	],
		// 	bgImage: healthCare,
		// },
		{
			slug: "financial-institutions",
			name: "Financial Institutions",
			description:
				"Connor Demelo and Cozy Cosentino cover top names and promising investments in the Financial Institutions Group, including Visa, Charles Schwab, and BMO.",
			tickers: "V|12M,SCHW|12M,JPM|12M,TSX:BMO|12M",
			value: 42000,
			return: 8.5,
			sp500Return: -5,
			portfolioComposition: [
				{ symbol: "V", name: "Visa Inc.", percentage: 40, color: "#FF6B6B" },
				{ symbol: "SCHW", name: "Charles Schwab", percentage: 25, color: "#4ECDC4" },
				{ symbol: "JPM", name: "JPMorgan Chase", percentage: 25, color: "#45B7D1" },
				{ symbol: "BMO", name: "Bank of Montreal", percentage: 10, color: "#96CEB4" }
			],
			holdings: [
				{ symbol: "V", name: "Visa Inc.", price: 295.67, change: 2.45, changePercent: 0.84, volume: 5234567 },
				{ symbol: "SCHW", name: "Charles Schwab", price: 68.92, change: -0.32, changePercent: -0.46, volume: 8765432 },
				{ symbol: "JPM", name: "JPMorgan Chase", price: 185.43, change: 1.87, changePercent: 1.02, volume: 12345678 },
				{ symbol: "BMO", name: "Bank of Montreal", price: 98.76, change: 0.54, changePercent: 0.55, volume: 2345678 }
			],
			bgImage: financial,
		},
		{
			slug: "tech-media-telecommunications",
			name: "Tech Media Telecommunications",
			description:
				"Eddy Aboukassm and Rafael Augusto cover the technology sector. An industry that drives innovation in software, hardware, AI, and semiconductors, shaping global industries. Currently, TMT holds positions in Accenture (ACN) and Cisco Systems (CSCO).",
			tickers: "ACN|12M,CSCO|12M,TSX:OTEX|12M,DIS|12M",
			value: 38500,
			return: 12.3,
			sp500Return: -5,
			portfolioComposition: [
				{ symbol: "ACN", name: "Accenture PLC", percentage: 35, color: "#FF6B6B" },
				{ symbol: "CSCO", name: "Cisco Systems Inc.", percentage: 30, color: "#4ECDC4" },
				{ symbol: "OTEX", name: "Open Text Corp", percentage: 20, color: "#45B7D1" },
				{ symbol: "DIS", name: "Walt Disney Company", percentage: 15, color: "#96CEB4" }
			],
			holdings: [
				{ symbol: "ACN", name: "Accenture PLC", price: 345.22, change: 4.12, changePercent: 1.21, volume: 2134567 },
				{ symbol: "CSCO", name: "Cisco Systems Inc.", price: 52.18, change: -0.89, changePercent: -1.68, volume: 18765432 },
				{ symbol: "OTEX", name: "Open Text Corp", price: 42.67, change: 1.23, changePercent: 2.97, volume: 1234567 },
				{ symbol: "DIS", name: "Walt Disney Company", price: 98.45, change: -1.34, changePercent: -1.34, volume: 9876543 }
			],
			bgImage: techMediaTelecom,
		},
		{
			slug: "consumer-retail",
			name: "Consumer & Retail",
			description:
				"Mohamed Emad and Noah Di Maio cover the biggest names and most attractive investment opportunities in the consumer staples  space,  analyzing market trends, and emerging consumer spending patterns like PEP and COST.",
			tickers: "LVMHF|12M,PEP|12M,TSX:JWEL|12M,GIS|12M,COST|12M,TSX:ATD|12M",
			value: 54200,
			return: 6.8,
			sp500Return: -5,
			portfolioComposition: [
				{ symbol: "LVMHF", name: "LVMH Moet Hennessy", percentage: 25, color: "#FF6B6B" },
				{ symbol: "PEP", name: "PepsiCo Inc.", percentage: 20, color: "#4ECDC4" },
				{ symbol: "JWEL", name: "Jamieson Wellness", percentage: 15, color: "#45B7D1" },
				{ symbol: "GIS", name: "General Mills Inc.", percentage: 15, color: "#96CEB4" },
				{ symbol: "COST", name: "Costco Wholesale", percentage: 15, color: "#FFA500" },
				{ symbol: "ATD", name: "Alimentation Couche-Tard", percentage: 10, color: "#9370DB" }
			],
			holdings: [
				{ symbol: "LVMHF", name: "LVMH Moet Hennessy", price: 842.50, change: 12.30, changePercent: 1.48, volume: 567890 },
				{ symbol: "PEP", name: "PepsiCo Inc.", price: 168.45, change: -2.14, changePercent: -1.25, volume: 3456789 },
				{ symbol: "JWEL", name: "Jamieson Wellness", price: 28.67, change: 0.78, changePercent: 2.80, volume: 234567 },
				{ symbol: "GIS", name: "General Mills Inc.", price: 67.89, change: 1.23, changePercent: 1.85, volume: 2345678 },
				{ symbol: "COST", name: "Costco Wholesale", price: 912.34, change: 8.45, changePercent: 0.94, volume: 1876543 },
				{ symbol: "ATD", name: "Alimentation Couche-Tard", price: 78.23, change: -0.67, changePercent: -0.85, volume: 876543 }
			],
			bgImage: consumerRetail,
		},
		{
			slug: "industrials-natural-resources",
			name: "Industrials & Natural Resources",
			description:
				"Faadel Asfari covers the Energy and Industrials sector, analyzing how key players like Enbridge, Xylem, and Nutrien adapt to regulatory changes, technological advancements, and sustainability trends to drive long-term growth and innovation.",
			tickers: "TSX:ENB|12M,TSX:CNQ|12M,J|12M,TSX:MG|12M,XYL|12M,TSX:CP|12M,TSX:NTR|12M,AMTM|12M",
			value: 47800,
			return: 9.2,
			sp500Return: -5,
			portfolioComposition: [
				{ symbol: "ENB", name: "Enbridge Inc.", percentage: 20, color: "#FF6B6B" },
				{ symbol: "CNQ", name: "Canadian Natural Resources", percentage: 18, color: "#4ECDC4" },
				{ symbol: "J", name: "Jacobs Solutions Inc.", percentage: 15, color: "#45B7D1" },
				{ symbol: "MG", name: "Magna International", percentage: 12, color: "#96CEB4" },
				{ symbol: "XYL", name: "Xylem Inc.", percentage: 12, color: "#FFA500" },
				{ symbol: "CP", name: "Canadian Pacific Railway", percentage: 12, color: "#9370DB" },
				{ symbol: "NTR", name: "Nutrien Ltd.", percentage: 8, color: "#FF69B4" },
				{ symbol: "AMTM", name: "Amentum Holdings", percentage: 3, color: "#20B2AA" }
			],
			holdings: [
				{ symbol: "ENB", name: "Enbridge Inc.", price: 59.45, change: 0.67, changePercent: 1.14, volume: 4567890 },
				{ symbol: "CNQ", name: "Canadian Natural Resources", price: 44.78, change: -0.89, changePercent: -1.95, volume: 3456789 },
				{ symbol: "J", name: "Jacobs Solutions Inc.", price: 138.23, change: 2.45, changePercent: 1.80, volume: 1234567 },
				{ symbol: "MG", name: "Magna International", price: 56.34, change: 1.12, changePercent: 2.03, volume: 2345678 },
				{ symbol: "XYL", name: "Xylem Inc.", price: 127.89, change: -1.23, changePercent: -0.95, volume: 1876543 },
				{ symbol: "CP", name: "Canadian Pacific Railway", price: 108.67, change: 0.89, changePercent: 0.83, volume: 1987654 },
				{ symbol: "NTR", name: "Nutrien Ltd.", price: 52.12, change: -0.45, changePercent: -0.86, volume: 2876543 },
				{ symbol: "AMTM", name: "Amentum Holdings", price: 23.45, change: 0.34, changePercent: 1.47, volume: 567890 }
			],
			bgImage: industrialsNaturalResources,
		},
		{
			slug: "health-care",
			name: "Health Care",
			description:
				"Cullan Bryne and Kartikay Dhamija focus on investing in leading and high-potential companies, particularly in pharmaceutical manufacturing and oncology, analyzing firms like Novo Nordisk and Pfizer to identify strong growth opportunities and long-term value creation.",
			tickers: "PFE|12M,VRTX|12M,NVO|12M",
			value: 32600,
			return: 11.7,
			sp500Return: -5,
			portfolioComposition: [
				{ symbol: "PFE", name: "Pfizer Inc.", percentage: 40, color: "#FF6B6B" },
				{ symbol: "VRTX", name: "Vertex Pharmaceuticals", percentage: 35, color: "#4ECDC4" },
				{ symbol: "NVO", name: "Novo Nordisk A/S", percentage: 25, color: "#45B7D1" }
			],
			holdings: [
				{ symbol: "PFE", name: "Pfizer Inc.", price: 26.78, change: 0.45, changePercent: 1.71, volume: 45678901 },
				{ symbol: "VRTX", name: "Vertex Pharmaceuticals", price: 472.34, change: 8.92, changePercent: 1.93, volume: 1234567 },
				{ symbol: "NVO", name: "Novo Nordisk A/S", price: 103.45, change: -1.23, changePercent: -1.17, volume: 2345678 }
			],
			bgImage: healthCare,
		},
		{
			slug: "fixed-income-real-estate",
			name: "Fixed-Income & Real Estate",
			description:
				"Luca Pecorada  cover the biggest names and most promising investments in the fixed income sector, such as Bank of America and Walmart.",
			tickers: "BAC|12M,WMT|12M,REI|12M,PLD|12M",
			value: 61200,
			return: 4.3,
			sp500Return: -5,
			portfolioComposition: [
				{ symbol: "BAC", name: "Bank of America", percentage: 30, color: "#FF6B6B" },
				{ symbol: "WMT", name: "Walmart Inc.", percentage: 25, color: "#4ECDC4" },
				{ symbol: "REI", name: "RingCentral Inc.", percentage: 25, color: "#45B7D1" },
				{ symbol: "PLD", name: "Prologis Inc.", percentage: 20, color: "#96CEB4" }
			],
			holdings: [
				{ symbol: "BAC", name: "Bank of America", price: 42.67, change: 0.78, changePercent: 1.86, volume: 67891234 },
				{ symbol: "WMT", name: "Walmart Inc.", price: 167.89, change: 1.45, changePercent: 0.87, volume: 8765432 },
				{ symbol: "REI", name: "RingCentral Inc.", price: 34.56, change: -0.89, changePercent: -2.51, volume: 3456789 },
				{ symbol: "PLD", name: "Prologis Inc.", price: 112.34, change: 0.67, changePercent: 0.60, volume: 2345678 }
			],
			bondTicker: [
				{
					s: "CA448810AC5|12M",
					d: "Hydro One 7.350%",
				},
				{
					s: "US478160CT9|12M",
					d: "Johnson & Johnson 6.95%",
				},
				{
					s: "US594918AD6|12M",
					d: "Microsoft 5.20%",
				},
				{
					s: "CA780086XL3|12M",
					d: "Royal Bank of Canada 4.632%",
				},
				{
					s: "BAC4273622|12M",
					d: "Bank of America 3.875%",
				},
				{
					s: "US931142CK7|12M",
					d: "Walmart 6.5% ",
				},
			],

			bgImage: fixedIncomeRealEstate,
		},
	],
	supportTeams: [
		{
			name: "Quantitative Research & Portfolio Risk",
			description:
				"Adam Bergen and Aidan Richer utilize proprietary models to conduct in-depth data analysis, providing insights into portfolio risk, optimizing asset allocation, and enhancing the fund’s overall investment strategy through rigorous quantitative methodologies.",
		},
		{
			name: "Economic Advisory",
			description:
				"Sean Clarke and Ethan Braga conduct in-depth analyses of macroeconomic trends, providing strategic insights into potential economic headwinds and tailwinds that impact JSOSIF’s investment decisions, helping teams navigate shifting market conditions and optimize portfolio positioning.",
		},
		{
			name: "Compliance & Special Situations",
			description:
				"Matthew Livingstone and Joseph Murtagh ensure the fund adheres to regulations and internal policies while analyzing market events like mergers, acquisitions, and restructurings to assess their impact on holdings and overall strategy.",
		},
		{
			name: "Software Development",
			description:
				"Aya Madi and Micheal Gibb develop and maintain the fund’s proprietary software, enabling efficient tracking, analysis, and management of investments through advanced data-driven tools that support strategic decision-making and portfolio optimization.",
		},
		{
			name: "Engagement & Recruiting",
			description:
				"Emma Tellier leads JSOSIF’s Marketing Team by managing media presence, planing impactful events, and fostering outreach to engage and expand our network, ensuring strong team visibility and strategic communication across all platforms.",
		},
	],
	teams: [
		{
			name: "Executive Team",
			banner: "/images/team-banners/executive_team_banner.avif",
			members: [
				{
					name: "Jacob Sweet",
					firstName: "Jacob",
					lastName: "Sweet",
					role: "Chief Executive Officer",
					program:
						"Commerce Finance Specialization Economics & Philosophy Minor",
					year: "3rd",
					joined: "Sept 2022",
					image: "../assets/pfps/jacobsweetpfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/jacob-sweet-853066214/",
				},
				{
					name: "Saif Jawdat",
					firstName: "Saif",
					lastName: "Jawdat",
					role: "Chief Investment Officer",
					program:
						"Honours Bcomm - Specializing in Finance and Minor in Economics & IT",
					year: "4th",
					joined: "Sept 2023",
					image: "../assets/pfps/saifjawdatpfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/saif-jawdat-54a645262/",
				},
				{
					name: "Nolan Robinson",
					firstName: "Nolan",
					lastName: "Robinson",
					role: "Chief Strategy Officer",
					program: "Double major finance economics",
					year: "3rd",
					joined: "Jan 2023",
					image: "../assets/pfps/nolanrobinsonpfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/nolan-robinson-13a591268?otpToken=MTMwNDFlZTAxMDI5Y2RjY2I1MmEwZmViNDExZGVmYjE4Y2NjZDk0OTkwYWE4YjZiN2JjZjA1NjY0YzVhNWNmMWY2ZDVkNmU5NThmNGQzZDA3ZGZmZGQ4YjNiN2U0YTgyMmQ1M2ZmNzNiNzlmZjBjMzNlY2RhM2JjLDEsMQ%3D%3D&midSig=35F84SMAOZ8rE1&eid=i72pha-m6o5njo8-j9&midToken=AQFMvyfDSaSFZg&trkEmail=eml-email_m2m_invite_single_01-header-0-profile_glimmer-null-i72pha%7Em6o5njo8%7Ej9-null-null&lipi=urn%3Ali%3Apage%3Aemail_email_m2m_invite_single_01%3BmRrUnsndTny8U1nNqk54uA%3D%3D&trk=eml-email_m2m_invite_single_01-header-0-profile_glimmer&originalSubdomain=ca",
				},
			],
		},
		{
			name: "Portfolio Managers",
			banner: "/images/team-banners/portfolio_managers.webp",
			members: [
				{
					name: "Connor Demelo",
					firstName: "Connor",
					lastName: "Demelo",
					role: "Financial Institutions",
					program:
						"Business Administration, Specialization in Finance with minors in Economics and IT",
					year: "4th",
					joined: "Jan 2023",
					image: "../assets/pfps/connordemelopfp.jpg",
					linkedin: "http://linkedin.com/in/connor-demelo-35174b267",
				},
				{
					name: "Edward Aboukassm",
					firstName: "Edward",
					lastName: "Aboukassm",
					role: "Tech Media Telecommunications",
					program: "Business, Specializing in Accounting",
					year: "4th",
					joined: "Oct 2022",
					image: "../assets/pfps/edwardaboukassmpfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/edward-aboukassm-6142a21a4/?originalSubdomain=ca",
				},
				{
					name: "Mohamad Emad",
					firstName: "Mohamad",
					lastName: "Emad",
					role: "Consumer & Retail",
					program: "Double Major in Business and Political Science",
					year: "3rd",
					joined: "Sept 2023",
					image: "../assets/pfps/mohamademadpfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/mohamad-emad?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
				},
				{
					name: "Faadel Asfari",
					firstName: "Faadel",
					lastName: "Asfari",
					role: "Industrials & Natural Resources",
					program:
						"Business Administration, Minor in Economics and Applied IT",
					year: "4th",
					joined: "Sept 2023",
					image: "../assets/pfps/faadelasfaripfp.jpg",
					linkedin: "http://linkedin.com/in/faadel-asfari-b926b922b",
				},
				{
					name: "Cullan Byrne",
					firstName: "Cullan",
					lastName: "Byrne",
					role: "Health Care",
					program:
						"Honours Business Administration, Specialization in Finance, Minor in Computer Science ",
					year: "2nd",
					joined: "Oct 2023",
					image: "../assets/pfps/cullanbyrnepfp.jpg",
					linkedin: "http://www.linkedin.com/in/cullan-byrne",
				},
				{
					name: "Luca Pecoraro",
					firstName: "Luca",
					lastName: "Pecoraro",
					role: "Fixed Income & Real Estate",
					program: "Business Administration (Finance specialization)",
					year: "4th",
					joined: "Jan 2023",
					image: "../assets/pfps/lucapecoraropfp.jpg",
					linkedin:
						"http://www.linkedin.com/in/luca-pecoraro-66a808230",
				},
			],
		},
		{
			name: "Senior Analysts",
			banner: "/images/team-banners/senior_analysts_banner.webp",
			members: [
				{
					name: "Eitan (Cozy) Cosentino",
					firstName: "Eitan (Cozy)",
					lastName: "Cosentino",
					role: "Financial Institutions",
					program: "Business Administration, Finance, Economics",
					year: "3rd",
					joined: "Sept 2024",
					image: "../assets/pfps/eitancosentinopfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/eitan-cosentino-429319257/",
				},
				{
					name: "Rafael Ferreira",
					firstName: "Rafael",
					lastName: "Ferreira",
					role: "Tech Media Telecommunications",
					program:
						"Master of Management with specialization in Business Data Analytics",
					year: "1st",
					joined: "Jan 2025",
					image: "../assets/pfps/rafaelferreirapfp.jpg",
					linkedin: "http://linkedin.com/in/rafaelaugustofs/",
				},
				{
					name: "Noah Di Maio",
					firstName: "Noah",
					lastName: "Di Maio",
					role: "Consumer & Retail",
					program: "Business, Accounting",
					year: "2nd",
					joined: "Sept 2024",
					image: "../assets/pfps/noahdimaiopfp.jpg",
					linkedin: "http://www.linkedin.com/in/noah-di-maio",
				},
				{
					name: "Jack Marcotte",
					firstName: "Jack",
					lastName: "Marcotte",
					role: "Industrials & Natural Resources",
					program:
						"Major: Business, Specialization: Finance, Minor: Economics",
					year: "2nd",
					joined: "Jan 2025",
					image: "../assets/pfps/jackmarcottepfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/jack-marcotte-74a6b3293/",
				},
				{
					name: "Kartikay Dhamija",
					firstName: "Kartikay",
					lastName: "Dhamija",
					role: "Health Care",
					program: "Finance Major, Economics Minor",
					year: "3rd",
					joined: "Jan 2025",
					image: "../assets/pfps/kartikaydhamijapfp.jpg",
					linkedin: "http://www.linkedin.com/in/kartikaydhamija",
				},
			],
		},
		{
			name: "Junior Analysts",
			banner: "/images/team-banners/junior_analyst_banner.avif",
			members: [
				{
					name: "Nick Mbugua",
					firstName: "Nick",
					lastName: "Mbugua",
					role: "Financial Institutions",
					program: "B.A Honors, Economics",
					year: "3rd",
					joined: "Sep 2024",
					image: "../assets/pfps/nickmbuguapfp.jpg",
					linkedin: "https://www.linkedin.com/in/nickmbugua/",
				},
				{
					name: "Prabh Sandhu",
					firstName: "Prabh",
					lastName: "Sandhu",
					role: "Financial Institutions",
					program: "Business Administration, Finance  ",
					year: "3rd",
					joined: "Jan 2025",
					image: "../assets/pfps/prabhsandhupfp.jpg",
					linkedin:
						"http://www.linkedin.com/in/prabh-sandhu-a555a4200",
				},
				{
					name: "Mariam Bakmaya",
					firstName: "Mariam",
					lastName: "Bakmaya",
					role: "Financial Institutions",
					program: "Business/Psych with a finance specialization",
					year: "2nd",
					joined: "Jan 2025",
					image: "../assets/pfps/mariambakmayapfp.jpg",
					linkedin:
						"http://www.linkedin.com/in/mariam-raphael-bakmaya-885862303",
				},
				{
					name: "James Botros",
					firstName: "James",
					lastName: "Botros",
					role: "Tech Media Telecommunications",
					program: "Civil Engineering ",
					year: "3rd",
					joined: "Jan 2025",
					image: "../assets/pfps/jamesbotrospfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/james-botros-456aa6295/",
				},
				{
					name: "Izzabella (Izzy) Kekelj",
					firstName: "Izzabella (Izzy)",
					lastName: "Kekelj",
					role: "Tech Media Telecommunications",
					program:
						"Bachelor of Commerce with a specalization in Finance and a minor in Computer Science",
					year: "2nd",
					joined: "Jan 2025",
					image: "../assets/pfps/izzabellakekeljpfp.jpg",
					linkedin: "http://www.linkedin.com/in/izabella-kekelj-",
				},
				{
					name: "Weiai Luo ",
					firstName: "Weiai",
					lastName: "Luo",
					role: "Consumer & Retail",
					program:
						"Master of Management - International Accounting & Financial",
					year: "1st",
					joined: "Jan 2025",
					image: "",
					linkedin: "https://www.linkedin.com/in/",      // linkedin not provided image not found
				},
				{
					name: "David Jesus",
					firstName: "David",
					lastName: "Jesus",
					role: "Consumer & Retail",
					program:
						"Bachelor of Business Administration- Finance Specialization",
					year: "2nd",
					joined: "Jan 2025",
					image: "../assets/pfps/davidjesuspfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/david-jesus-17baaa2b6/",
				},
				{
					name: "Jada Yaldo",
					firstName: "Jada",
					lastName: "Yaldo",
					role: "Consumer & Retail",
					program: "Combined Major in Psychology and Criminology",
					year: "3rd",
					joined: "Jan 2025",
					image: "../assets/pfps/jadayaldopfp.jpg",
					linkedin: "https://www.linkedin.com/in/jada-yaldo-4568192b8/",
				},
				{
					name: "Krish Kaushik",
					firstName: "Krish",
					lastName: "Kaushik",
					role: "Industrials & Natural Resources",
					program: "BCom mahout finance minor economics ",
					year: "3rd",
					joined: "Nov 2024",
					image: "../assets/pfps/krishkaushikpfp.jpg",
					linkedin: "https://www.linkedin.com/in/krish-kaushik-5361bb346/",
				},
				{
					name: "Travis Loughead",
					firstName: "Travis",
					lastName: "Loughead",
					role: "Industrials & Natural Resources",
					program: "Business Administration ",
					year: "2nd",
					joined: "Jan 2025",
					image: "../assets/pfps/travislougheadpfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/travis-loughead-0a1504293/?originalSubdomain=ca",
				},
				{
					name: "Kohen Colenutt",
					firstName: "Kohen",
					lastName: "Colenutt",
					role: "Health Care",
					program:
						"Business Administration, Specialization in Finance",
					year: "2nd",
					joined: "Sept 2024",
					image: "../assets/pfps/kohencolenuttpfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/kohen-colenutt-292800333?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
				},
				{
					name: "Andrew Booth",
					firstName: "Andrew",
					lastName: "Booth",
					role: "Health Care",
					program:
						"Business Administration, Accounting Specialization, Minor in Economics",
					year: "2nd",
					joined: "Jan 2025",
					image: "../assets/pfps/andrewboothpfp.jpg",
					linkedin: "https://www.linkedin.com/in/andrewbooth-/",
				},
				{
					name: "Gabriel Safieddine",
					firstName: "Gabriel",
					lastName: "Safieddine",
					role: "Health Care",
					program:
						"Business commerce, finance specialization, minor in computer science & Economics",
					year: "4th",
					joined: "Jan 2024",
					image: "../assets/pfps/gabrielsafieddinepfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/gabriel-safieddine?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
				},
				{
					name: "Alexander Dougall",
					firstName: "Alexander",
					lastName: "Dougall",
					role: "Fixed Income & Real Estate",
					program:
						"Honours Business Administration & Psychology, specializing in Human Resource Management",
					year: "3rd",
					joined: "Jan 2025",
					image: "../assets/pfps/alexanderdougallpfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/alexander-dougall-977ba91b0/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
				},
				{
					name: "Mary Aoun",
					firstName: "Mary",
					lastName: "Aoun",
					role: "Fixed Income & Real Estate",
					program:
						"Business Administration/Finance. Minor Applied Information Technology ",
					year: "4th",
					joined: "Jan 2024",
					image: "../assets/pfps/maryaounpfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/mary-aoun-882a6517a/",
				},
				{
					name: "Linda Thao Nguyen",
					firstName: "Linda Thao",
					lastName: "Nguyen",
					role: "Fixed Income & Real Estate",
					program: "Master of Management - Data Analytics Stream",
					year: "1st",
					joined: "Jan 2025",
					image: "../assets/pfps/lindanguyenpfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/linda-nguyen28?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
				},
			],
		},
		{
			name: "Economic Advisory",
			banner: "/images/team-banners/economic_advisory_banner.avif",
			members: [
				{
					name: "Sean Clarke",
					firstName: "Sean",
					lastName: "Clarke",
					role: "Lead Economist",
					program:
						"Honours Bachelor of Commerce–Business Administration, specialization in accounting, minor in computer science",
					year: "3rd",
					joined: "Sept 2022",
					image: "../assets/pfps/seanclarkepfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/sean-clarke-529294251?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
				},
				{
					name: "Ethan Braga",
					firstName: "Ethan",
					lastName: "Braga",
					role: "Senior Economist",
					program: "BA in Economics",
					year: "3rd",
					joined: "Oct 2023",
					image: "../assets/pfps/ethanbragapfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/ethan-braga-8bb390294/",
				},
				{
					name: "Houshang Javan",
					firstName: "Houshang",
					lastName: "Javan",
					role: "Junior Economist",
					program: "Masters in Applied Economics and Policy",
					year: "1st",
					joined: "Jan 2025",
					image: "../assets/pfps/houshangjavanpfp.jpg",
					linkedin: "https://www.linkedin.com/in/houshang-javan/",
				},
				{
					name: "Nathan Kemp-Dove",
					firstName: "Nathan",
					lastName: "Kemp-Dove",
					role: "Junior Economist",
					program: "Business Administration, Finance, Economics",
					year: "1st",
					joined: "Sept 2024",
					image: "../assets/pfps/nathankempdovepfp.jpg",
					linkedin: "http://www.linkedin.com/in/nathan-kemp-dove",
				},
				{
					name: "Nanki Bhatia",
					firstName: "Nanki",
					lastName: "Bhatia",
					role: "Junior Economist",
					program:
						"Bachelor of Commerce (Honours) Business Administration with specialization in finance and minor in economics.",
					year: "4th",
					joined: "Jan 2025",
					image: "../assets/pfps/nankibhatiapfp.jpg",
					linkedin: "https://www.linkedin.com/in/nankibhatia",
				},
			],
		},
		{
			name: "Compliance & Special Situations",
			banner: "/images/team-banners/quant_portfolio_risk_banner.avif",
			members: [
				{
					name: "Matthew Livingstone",
					firstName: "Matthew",
					lastName: "Livingstone",
					role: "Lead Compliance Officer",
					program: "Business, Finance",
					year: "2nd",
					joined: "Jan 2025",
					image: "../assets/pfps/matthewlivingstonepfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/matthew-livingstone-a457b02a3?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
				},
				{
					name: "Joseph Murtagh",
					firstName: "Joseph",
					lastName: "Murtagh",
					role: "Senior Legal Consultant",
					program: "Bachelor of Commerce & Computer Science",
					year: "1st",
					joined: "Jan 2025",
					image: "../assets/pfps/josephmurtaghpfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/joseph-murtagh-18b34032b/",
				},
			],
		},
		{
			name: "Quantitative Research & Portfolio Risk",
			banner: "/images/team-banners/quant_portfolio_risk_banner.avif",
			members: [
				{
					name: "Adam Bergen",
					firstName: "Adam",
					lastName: "Bergen",
					role: "Lead Quantitative Analyst",
					program: "Business, Finance, Economics",
					year: "3rd",
					joined: "Oct 2023",
					image: "../assets/pfps/adambergenpfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/adam-bergen-7223bb262/",
				},
				{
					name: "Aidan Richer",
					firstName: "Aiden",
					lastName: "Richer",
					role: "Senior Quantitative Analyst",
					program:
						"Bachelor of Mathematics - Mathematics and Finance; Minor in Economics",
					year: "3rd",
					joined: "Jan 2024",
					image: "../assets/pfps/aidanricherpfp.jpg",
					linkedin: "http://www.linkedin.com/in/aidanricher",
				},
				{
					name: "Kumayl Hooda",
					firstName: "Kumayl",
					lastName: "Hooda",
					role: "Junior Quantitative Analyst",
					program: "Major: Business (Minor: Comp Sci, IT)",
					year: "4th",
					joined: "Jan 2025",
					image: "../assets/pfps/kumaylhoodapfp.jpg",
					linkedin: "https://ca.linkedin.com/in/kumaylhooda",
				},
				{
					name: "Max Mullins",
					firstName: "Max",
					lastName: "Mullins",
					role: "Junior Quantitative Analyst",
					program:
						"Bachelor of Mathematics (Honours) - Math and Finance",
					year: "2nd",
					joined: "Jan 2025",
					image: "",			// no pfp found
					linkedin:
						"https://www.linkedin.com/in/max-mullins-01610a257/",
				},
			],
		},
		{
			name: "Software Development",
			banner: "/images/team-banners/software_development_banner.webp",
			members: [
				{
					name: "Aya Madi",
					firstName: "Aya",
					lastName: "Madi",
					role: "Lead Software Developer",
					program:
						"Business and Computer Science, Finance Specialization",
					year: "4th",
					joined: "Oct 2022",
					image: "../assets/pfps/ayamadipfp.jpg",
					linkedin: "http://www.linkedin.com/in/aya-madi",
				},
				{
					name: "Michael Gibb",
					firstName: "Michael",
					lastName: "Gibb",
					role: "Senior Software Developer",
					program: "Computer Science",
					year: "3rd",
					joined: "Jan 2023",
					image: "../assets/pfps/michaelgibbpfp.jpg",
					linkedin: "https://www.linkedin.com/in/michael-e-gibb",
				},
				{
					name: "Landon Hadre",
					firstName: "Landon",
					lastName: "Hadre",
					role: "Software Developer",
					program:
						"Computer Science with Honours Applied Computing and a minor in Applied IT",
					year: "3rd",
					joined: "Nov 2024",
					image: "../assets/pfps/landonhadrepfp.jpg",
					linkedin: "https://www.linkedin.com/in/landonhadre/",
				},
				{
					name: "Ethan Konkolowicz",
					firstName: "Ethan",
					lastName: "Konkolowicz",
					role: "Software Developer",
					program:
						"Bachelor of Computing Science with Honours Applied Computing",
					year: "3rd",
					joined: "Nov 2024",
					image: "../assets/pfps/ethankonkolowiczpfp.jpg",
					linkedin: "https://www.linkedin.com/in/ethan-konk/",
				},
				{
					name: "Kevin Neave",
					firstName: "Kevin",
					lastName: "Neave",
					role: "Junior Software Developer",
					program: "Computer Science, Software Engineering",
					year: "2nd",
					joined: "Jan 2025",
					image: "../assets/pfps/kevinneavepfp.jpg",
					linkedin: "http://linkedin.com/in/kevin-neave-zx374",
				},
				{
					name: "Adam El-Houssami",
					firstName: "Adam",
					lastName: "El-Houssami",
					role: "Junior Software Developer",
					program: "Computer Science",
					year: "1st",
					joined: "Jan 2025",
					image: "../assets/pfps/adamelhoussamipfp.jpg",
					linkedin: "https://www.linkedin.com/in/adam-el-houssami-947185272/",
				},
			],
		},
		{
			name: "Engagement & Recruiting",
			banner: "/images/team-banners/engagement_recruiting.webp",
			members: [
				{
					name: "Emma Tellier",
					firstName: "Emma",
					lastName: "Tellier",
					role: "Head of Marketing ",
					program: "Concurrent Education / Bachelor of English ",
					year: "3rd",
					joined: "Oct 2023",
					image: "../assets/pfps/emmatellierpfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/emma-tellier-895877291?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
				},
				{
					name: "Joelle Jawdat",
					firstName: "Joelle",
					lastName: "Jawdat",
					role: "Media and Recruiting Associate",
					program: "Law and Politics, Minor in Economics ",
					year: "1st",
					joined: "Dec 2024",
					image: "../assets/pfps/joellejawdatpfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/joelle-jawdat-789058337?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
				},
				{
					name: "Yazareth Meneses Arrieta",
					firstName: "Yazareth",
					lastName: "Meneses Arrieta",
					role: "Media creator ",
					program: "Business and psychology",
					year: "1st",
					joined: "Jan 2025",
					image: "../assets/pfps/yazarethmenesesarrietapfp.jpg",
					linkedin:
						"https://www.linkedin.com/in/yazareth-meneses-arrieta-519117337?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
				},
				{
					name: "Sagal Rirash",
					firstName: "Sagal",
					lastName: "Rirash",
					role: "Marketer",
					program:
						"Business Administration Specialization in Human Resources",
					year: "3rd",
					joined: "Jan 2025",
					image: "../assets/pfps/sagalrirashpfp.jpg",
					linkedin: "http://www.linkedin.com/in/sagal-rirash",
				},
			],
		},
	],
	alumni: [
		{
			name: "Nico Fazio",
			position: "Business Development",
			company: "XTX Markets",
			program: "BCOM specalization in Finance",
			year: "2017-2020",
			image: "../assets/pfps/nicofaziopfp.jpg",
			blurb: "XTX Markets is a leading algorithmic trading firm partnering with counterparties, exchanges and e-trading venues globally to provide liquidity in the Equity, FX, Fixed Income, Commodity and Options markets. I work in the Business Development team. My avid involvement in JSOSIF was directly responsible for my eventual internships in Corporate Banking and subsequent career in the capital markets. It is the single most impactful and profitable extra-curricular experience offered by the University of Windsor.",
			linkedin: "https://www.linkedin.com/in/nicofazio/",
		},
	],
	users: [
		{
			email: 'admin',
			password: 'admin',
			name: 'Admin User',
			role: 'Admin',
		},
		{
			email: 'user',
			password: 'user',
			name: 'Regular User',
			role: 'User',
		},
		{
			email: 'jsweet@uwindsor.ca',
			password: 'sweet',
			name: 'Jacob Sweet',
			role: 'Admin',
		},
		{
			email: 'gibbm@uwindsor.ca',
			password: 'gibb',
			name: 'Michael Gibb',
			role: 'User',
		},
	],
};

//mock api functions
export const fetchStatistics = async () => mockApiData.statistics;
export const fetchInvestmentDivisions = async () =>
	mockApiData.investmentDivisions;
export const fetchSupportTeams = async () => mockApiData.supportTeams;
export const fetchTeams = async () => mockApiData.teams;
export const fetchAlumni = async () => mockApiData.alumni;
export const fetchUserByCredentials = async (email: string, password: string) => {
	const users = mockApiData.users;
	return users.find((user) => user.email === email && user.password === password) || null;
  };// {
// 	name: "",
// 	role: "",
// 	program: "",
// 	year: "",
// 	joined: "",
// 	image: "",
// 	linkedin: "https://www.linkedin.com/in/",
// }
