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
		{
			name: "Financial Institutions",
			description:
				"Connor Demelo and Cozy Cosentino cover top names and promising investments in the Financial Institutions Group, including Visa, Charles Schwab, and BMO, highlighting industry leaders and strong performers.",
			ticker: "V|12M, SCHW|12M, JPM|12M, TSX:BMO|12M",
			bgImage: financial,
		},
		{
			name: "Tech Media Telecommunications",
			description:
				"Eddy Aboukassm and Rafael Augusto cover the technology sector. An industry that drives innovation in software, hardware, AI, and semiconductors, shaping global industries. Currently, TMT holds positions in Accenture (ACN) and Cisco Systems (CSCO).",
			ticker: "ACN|12M, CSCO|12M, TSX:OTEX|12M, DIS|12M",
			bgImage: techMediaTelecom,
		},
		{
			name: "Consumer & Retail",
			description:
				"Mohamed Emad and Noah Di Maio cover the biggest names and most attractive investment opportunities in the consumer staples  space,  analyzing market trends, and emerging consumer spending patterns like PEP and COST.",
			ticker: "LVMHF|12M, PEP|12M, TSX:JWEL|12M, GIS|12M, COST|12M, TSX:ATD|12M",
			bgImage: consumerRetail,
		},
		{
			name: "Industrials & Natural Resources",
			description:
				"Faadel Asfari covers the Energy and Industrials sector, analyzing how key players like Enbridge, Xylem, and Nutrien adapt to regulatory changes, technological advancements, and sustainability trends to drive long-term growth and innovation.",
			ticker: "TSX:ENB|12M, TSX:CNQ|12M, J|12M, TSX:MG|12M, XYL|12M, TSX:CP|12M, TSX:NTR|12M, AMTM",
			bgImage: industrialsNaturalResources,
		},
		{
			name: "Health Care",
			description:
				"Cullan Bryne and Kartikay Dhamija focus on investing in leading and high-potential companies, particularly in pharmaceutical manufacturing and oncology, analyzing firms like Novo Nordisk and Pfizer to identify strong growth opportunities and long-term value creation.",
			ticker: "PFE|12M, VRTX|12M, NVO|12M",
			bgImage: healthCare,
		},
		{
			name: "Fixed-Income & Real Estate",
			description:
				"Luca Pecorada  cover the biggest names and most promising investments in the fixed income sector, such as Bank of America and Walmart.",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQEmfSZUrXkfRQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1668385805304?e=1744243200&v=beta&t=ogpAb7X4Q9b_UJKY9yH88VFFH_khyjPVsizpNjdId0Q",
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
					image: "https://media.licdn.com/dms/image/v2/D4E03AQFMoP650DnFLA/profile-displayphoto-shrink_400_400/B4EZRnB.6OHgAo-/0/1736895361078?e=1744243200&v=beta&t=l9VnchdcFc0e31WViBaqPcnOuxBAOl0_GIxI9vz3-BA",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQEHn82Vbjo8eA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1682728499021?e=1744848000&v=beta&t=KpDA5cuAvufWPmbEXO9ph56TxD-DuNUaifOVHDGRDGU",
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
					image: "https://media.licdn.com/dms/image/v2/D4E03AQGDsoguNW8RuA/profile-displayphoto-shrink_400_400/B4EZOcXCq7GQAg-/0/1733495107238?e=1744243200&v=beta&t=0R8EV3OIqPXS-TAM-BWE3iYQM-qQXK9JHdsSYWJsbHg",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQH1pnYQaqravQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1669688697141?e=1744848000&v=beta&t=cZSIdayttHN7J4_YxYefb0GDYXWaNZTZuPHXJx0urUU",
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
					image: "https://media.licdn.com/dms/image/v2/D4E03AQFahDbQDBlfeQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1723491171400?e=1744243200&v=beta&t=58q5CGRqrzpHBpnSfyHp4UbJ0Al8d_TEvLBFmPnLpdI",
					linkedin:
						"https://www.linkedin.com/in/mohamad-emad?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
				},
				{
					name: "Fadel Asfari",
					firstName: "Fadel",
					lastName: "Asfari",
					role: "Industrials & Natural Resources",
					program:
						"Business Administration, Minor in Economics and Applied IT",
					year: "4th",
					joined: "Sept 2023",
					image: "https://media.licdn.com/dms/image/v2/D5603AQGKptCB5JgDcg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1691640272494?e=1744243200&v=beta&t=mGj5dSJjm6XalsKkcgpR2gGJj0c__Cwd7Hbltqhd8aU",
					linkedin: "http://linkedin.com/in/faadel-asfari-b926b922b",
				},
				{
					name: "Cullan Bryne",
					firstName: "Cullan",
					lastName: "Bryne",
					role: "Health Care",
					program:
						"Honours Business Administration, Specialization in Finance, Minor in Computer Science ",
					year: "2nd",
					joined: "Oct 2023",
					image: "https://media.licdn.com/dms/image/v2/D4E03AQFm3lHvEArffA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1701305242851?e=1744243200&v=beta&t=uSEeW4qRI6JS4dgWLnKC_s0q4zMwdZUSRQCJ0Mrlrfg",
					linkedin: "http://www.linkedin.com/in/cullan-byrne",
				},
				{
					name: "Luca Pecorada",
					firstName: "Luca",
					lastName: "Pecorada",
					role: "Fixed Income & Real Estate",
					program: "Business Administration (Finance specialization)",
					year: "4th",
					joined: "Jan 2023",
					image: "https://media.licdn.com/dms/image/v2/D5603AQGqb86yr_IAzQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1700691369849?e=1744848000&v=beta&t=zftZLTR6dRj_lVNUBnXxsOVO1Ua6FHYhCIlP8l3XJUk",
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
					name: "Eitan Cozy Cosentino",
					firstName: "Eitan Cozy",
					lastName: "Cosentino",
					role: "Financial Institutions",
					program: "Business Administration, Finance, Economics",
					year: "3rd",
					joined: "Sept 2024",
					image: "https://media.licdn.com/dms/image/v2/D4E03AQGnLhcnxyIFvQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1668545416449?e=1744243200&v=beta&t=gEynNpAYF8JdWaYaq3mU6O-yJgkQCHSZ8cUBAiMpWRM",
					linkedin:
						"https://www.linkedin.com/in/cozy-eitan-cosentino-429319257/",
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
					image: "https://media.licdn.com/dms/image/v2/C4E03AQG62xrfnT1smA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1516900102201?e=1744848000&v=beta&t=b_QDnA6nJG6z1HyYnxehojq_JnV6kmnMdqtnlGSfB44",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQHogeyScxjDlw/profile-displayphoto-shrink_400_400/B56ZRPmeUdGQAg-/0/1736502275028?e=1744243200&v=beta&t=m-v4-Aoex2wLMY_YgyjA5UXkVDBoBk536UT292HNhBM",
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
					image: "https://media.licdn.com/dms/image/v2/D4E03AQERVrpILL5-Zw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1727467548770?e=1744848000&v=beta&t=qULgTAca9Ve9VfL-ZfDL1D8XuCnOEJfB3lnPLGpcx6w",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQEGZu4imLzgmg/profile-displayphoto-shrink_400_400/B56ZP8s4sNG8Ag-/0/1735111446514?e=1744243200&v=beta&t=mgKrsO4qXxIYqWAGhALWcehSN7ZPSOcRR-0ubv-kyD0",
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
					image: "https://media.licdn.com/dms/image/v2/D4D03AQFLSNgswHJ9pA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1732292882416?e=1744848000&v=beta&t=-fjSni0yuJyJXtXQ3hfoKpLxodBOsnxqfBd3idfr1zw",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQGMAn5M6yZNzQ/profile-displayphoto-shrink_400_400/B56ZODmJByG4As-/0/1733079634937?e=1744848000&v=beta&t=z7RqtMpF9AjHuFOzVFtaNScIBte3IdbSo_cSj8BM1DU",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQHUe1MHRwwQvw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1729819695392?e=1744243200&v=beta&t=Hq9Df-PlGM-dVyn8zw_106ZERik_U3rUk61LDNvHB80",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQE7l-XmEynJbg/profile-displayphoto-shrink_400_400/B56ZRS7R55H0Ag-/0/1736558060040?e=1744243200&v=beta&t=pi0g50H8uh5B11A2uG7Zqtfc-jE5CCLVK3aUt06Oay0",
					linkedin:
						"https://www.linkedin.com/in/james-botros-456aa6295/",
				},
				{
					name: "Izzy Kekelji",
					firstName: "Izzy",
					lastName: "Kekelji",
					role: "Tech Media Telecommunications",
					program:
						"Bachelor of Commerce with a specalization in Finance and a minor in Computer Science",
					year: "2nd",
					joined: "Jan 2025",
					image: "https://media.licdn.com/dms/image/v2/D4E03AQGXEAgtUrQNOw/profile-displayphoto-shrink_400_400/B4EZRCMU1GGwAk-/0/1736277315388?e=1744243200&v=beta&t=thCMhK3BhH-jTHY9PNKyGAQ0TaCp18vPdJ1z0pf1TcQ",
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
					linkedin: "https://www.linkedin.com/in/",
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
					image: "https://media.licdn.com/dms/image/v2/D4D03AQGKfK54Y6WMvA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1709167473698?e=1744848000&v=beta&t=ZxH3pMyZ_t5jJT0sYvc5M_PglHv382_48aGrs1l_fio",
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
					image: "",
					linkedin: "https://www.linkedin.com/in/",
				},
				{
					name: "Krish Kaushik",
					firstName: "Krish",
					lastName: "Kaushik",
					role: "Industrials & Natural Resources",
					program: "BCom mahout finance minor economics ",
					year: "3rd",
					joined: "Nov 2024",
					image: "",
					linkedin: "https://www.linkedin.com/in/",
				},
				{
					name: "Travis Loughead",
					firstName: "Travis",
					lastName: "Loughead",
					role: "Industrials & Natural Resources",
					program: "Business Administration ",
					year: "2nd",
					joined: "Jan 2025",
					image: "https://media.licdn.com/dms/image/v2/D4E03AQF_dbhVij-hSQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1726108867147?e=1744848000&v=beta&t=az6miduUmPQQ1ZWJ7sln7D_6x5fzuhRXw9aR_fdb80c",
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
					image: "https://media.licdn.com/dms/image/v2/D4E03AQFyiCHxzT81Xg/profile-displayphoto-shrink_400_400/B4EZOXyILdGQAw-/0/1733418321559?e=1744243200&v=beta&t=2WWF-8JoSXrpH6eBTY-t7Y7EYoqGMZ8n22vynr8cqBc",
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
					image: "https://media.licdn.com/dms/image/v2/D4E03AQF4Qg9lCgQq0w/profile-displayphoto-shrink_400_400/B4EZQSqoEkGwAg-/0/1735479951941?e=1744243200&v=beta&t=J4kEEdumkU-UwMYG31RsTpioOz8jXF98bwVGOsgRD5w",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQFH_JJKq6awqA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1715898278586?e=1744243200&v=beta&t=ax6v7t62Zh5ZxcMMEkiihXCaNWx0hXd4jMDdEOqIsdQ",
					linkedin:
						"https://www.linkedin.com/in/gabriel-safieddine?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
				},
				{
					name: "Alexander Dougal",
					firstName: "Alexander",
					lastName: "Dougal",
					role: "Fixed Income & Real Estate",
					program:
						"Honours Business Administration & Psychology, specializing in Human Resource Management",
					year: "3rd",
					joined: "Jan 2025",
					image: "https://media.licdn.com/dms/image/v2/D4E03AQHmN3ySagF-pw/profile-displayphoto-shrink_400_400/B4EZRGa8YUHAAk-/0/1736348256463?e=1744243200&v=beta&t=NSyCT9C2ML2-wO2vPbzjE6zu6x6N21h5cN0N2g6Lb30",
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
					image: "https://media.licdn.com/dms/image/v2/D4E03AQHeKIn29hqq_A/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1732005397799?e=1744243200&v=beta&t=e5TvNkBtZcPNcsZaubuEtJECr0zZgV4j7PKwD9LJpI0",
					linkedin:
						"https://www.linkedin.com/in/mary-aoun-882a6517a/",
				},
				{
					name: "Huong Thao Nguyen",
					firstName: "Huong Thao",
					lastName: "Nguyen",
					role: "Fixed Income & Real Estate",
					program: "Master of Management - Data Analytics Stream",
					year: "1st",
					joined: "Jan 2025",
					image: "https://media.licdn.com/dms/image/v2/D5603AQElL878suS_hw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1695093638471?e=1744243200&v=beta&t=nzwrck2m5Bx0J8ny3VBcviURVjPFFYuLX81z9KiHY4I",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQF2erJ-DSjdDA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1701481382087?e=1744243200&v=beta&t=DmQ7VJ_Wk_ZT1h3lRmfsQeO5lio5fa3ngyaCmNqxdks",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQHjZ0G4tNDLXg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1700112010776?e=1744243200&v=beta&t=WsD_PSSK8nxNAmCiKX9nWmavObvh1OBCDsXW8I9TlHg",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQHKMGtZyOqtPQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1713992002225?e=1744243200&v=beta&t=74iN95507yVVmU7XTztyVtKNu0uPK5_GUbXs_XzxMdA",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQE_YuN4dvyKbA/profile-displayphoto-shrink_400_400/B56ZPYIfzPGQAo-/0/1734497926644?e=1744848000&v=beta&t=DoDiZIsWiyP6UOb4PfmwdzxajxC8sFhoMIqUuCsWBhU",
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
					image: "https://media.licdn.com/dms/image/v2/D4E03AQHDEQSRnA0-VA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1730951694614?e=1744243200&v=beta&t=oxlT_MGZM-QFDVXegbl1ilZCxU7Ynsdi-lYT4HPQwgY",
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
					image: "https://media.licdn.com/dms/image/v2/D4D03AQEGC5q-HWH-Mg/profile-displayphoto-shrink_800_800/B4DZTcUFc2GcAk-/0/1738863041440?e=1744243200&v=beta&t=hzWEaxI5-ffqAaJbIMuUHjv-A58_d2kpm95SPQM7eeM",
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
					image: "https://media.licdn.com/dms/image/v2/D4E03AQEC3BAEPSpdAw/profile-displayphoto-shrink_400_400/B4EZSodeszHoAg-/0/1737993088950?e=1744848000&v=beta&t=gWFjJQ2Sl_2mFEq7kVqKfTWrceRdz4TT-PWLZW5eBBI",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQFUt-Gw1WUq9Q/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1700152760577?e=1744243200&v=beta&t=QoxU0tCBfW2XYJKerjmTRmYJ_6AciL64FZHi71ErXFo",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQEbLBNvnHQKHg/profile-displayphoto-shrink_400_400/B56ZROFcMNGoAo-/0/1736476837321?e=1744243200&v=beta&t=AKM-1Njrff-YC4TH0JTJOmkOEzHWxjjJyf-vVMXt_pM",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQH5oh2X2YwexQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1724985536406?e=1744848000&v=beta&t=IXURR2KDPXuDOyGRp1_Z9_y9-kP2DNT1J-AV2XZ1Xtc",
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
					image: "",
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
					image: "https://media.licdn.com/dms/image/v2/D4E03AQEBOdu6ymyuog/profile-displayphoto-shrink_400_400/B4EZSltolCHgAg-/0/1737946991397?e=1744243200&v=beta&t=JJTLX5A0SRC3CvtSH9AcFEtksL-4_6AdL5Fqg-ERBgs",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQGKitaFHlm3xQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1722281073141?e=1744243200&v=beta&t=tnNz0HnacMi8voRW4dg-KqcC0tX8wFXUJfq5cZjKlz4",
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
					image: "https://media.licdn.com/dms/image/v2/D4E03AQGS2Z6H58ut-Q/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1726583437365?e=1744243200&v=beta&t=pHNPzbbjw3-VdZlv_SNQviHMBhjrFXKFofG8OJFURXw",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQHhYFvFdcg1-w/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1730481713695?e=1744243200&v=beta&t=7yYKOqMLRCqQFHtykf0YosbWJyKyzzioTlmKw1B1CZk",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQH6Zoml9zpaQA/profile-displayphoto-shrink_400_400/B56ZNvw9PaGgAg-/0/1732746926191?e=1744243200&v=beta&t=e5wx4rp8PDBWjCXGUeYpiaUgzQ-zvr6N8z6lfImNQ1o",
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
					image: "",
					linkedin: "https://www.linkedin.com/in/",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQHY_bbcrO_r-Q/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1731976916621?e=1744243200&v=beta&t=WtWdVf4XwOjPV8UZ54ZPiPRNpHyWKl6mVhFWzD9q0lE",
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
					image: "https://media.licdn.com/dms/image/v2/D4E03AQGnwEVly4x61A/profile-displayphoto-shrink_400_400/B4EZTdZBw5HcAk-/0/1738881113608?e=1744243200&v=beta&t=9iACnLDXC-GgpcOTnCdVe7JwtrUsllH-XzFvqB9wpmI",
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
					image: "https://media.licdn.com/dms/image/v2/D4E03AQESazTuRoUBjA/profile-displayphoto-shrink_400_400/B4EZOTKgRsHsAg-/0/1733340825414?e=1744243200&v=beta&t=FbPO7ou2MHCqquSpZN6AnE3NRYR-G0hubiMytMGvxHg",
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
					image: "https://media.licdn.com/dms/image/v2/D5603AQHmwXpNhLXqEw/profile-displayphoto-shrink_400_400/B56ZRDq2G3H0Ag-/0/1736302093092?e=1744848000&v=beta&t=PVcINJ-hbT0e8zH5wXvUx965qwhtNRZ3JxKl5Kjqxy8",
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
			image: "https://media.licdn.com/dms/image/v2/D4E03AQFomW6Ks3zR0g/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1729457800696?e=1744243200&v=beta&t=gAi2uixOQ_b1t0iRBVL3_tmj-5rBC-UOZPZdWCqq_4o",
			blurb: "XTX Markets is a leading algorithmic trading firm partnering with counterparties, exchanges and e-trading venues globally to provide liquidity in the Equity, FX, Fixed Income, Commodity and Options markets. I work in the Business Development team. My avid involvement in JSOSIF was directly responsible for my eventual internships in Corporate Banking and subsequent career in the capital markets. It is the single most impactful and profitable extra-curricular experience offered by the University of Windsor.",
			linkedin: "https://www.linkedin.com/in/nicofazio/",
		},
	],
	users: [
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
// },
