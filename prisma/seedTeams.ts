import { PrismaClient } from "../src/generated/prisma/client";
import { config } from "dotenv";
import { join } from "path";

config({ path: join(process.cwd(), ".env") });

const prisma = new PrismaClient();

const teams = [
  {
    name: "Financial Institutions",
    description:
      "Investment team focused on financial services, banking, and insurance sectors",
    teamType: "Investment",
  },
  {
    name: "Fixed Income & Real Estate",
    description:
      "Investment team specializing in fixed income securities and real estate investments",
    teamType: "Investment",
  },
  {
    name: "Consumer & Retail",
    description:
      "Investment team covering consumer goods, retail, and consumer services sectors",
    teamType: "Investment",
  },
  {
    name: "Healthcare",
    description:
      "Investment team focused on healthcare, pharmaceuticals, and biotechnology sectors",
    teamType: "Investment",
  },
  {
    name: "Tech, Media, & Communications",
    description:
      "Investment team covering technology, media, telecommunications, and digital services",
    teamType: "Investment",
  },
  {
    name: "Industrials & Natural Resources",
    description:
      "Investment team focused on industrial companies, energy, and natural resources sectors",
    teamType: "Investment",
  },
  {
    name: "Executives",
    description:
      "Executive leadership team responsible for fund management and strategic decisions",
    teamType: "Support",
  },
  {
    name: "Economic Advisory",
    description:
      "Economic advisory team providing insights into economic trends and market conditions",
    teamType: "Support",
  },
  {
    name: "Compliance & Special Situations",
    description: "Compliance & Special Situations description",
    teamType: "Support",
  },
  {
    name: "Quantitative Research & Portfolio Risk",
    description: "Quantitative research description",
    teamType: "Support",
  },
  {
    name: "Software Development",
    description: "Software development description",
    teamType: "Support",
  },
  {
    name: "Engagement & Recruiting",
    description: "Engagement & Recruiting description",
    teamType: "Support",
  },
];

async function main() {
  console.log("Seeding teams...");

  for (const teamData of teams) {
    const team = await prisma.team.upsert({
      where: { name: teamData.name },
      update: {
        description: teamData.description,
        teamType: teamData.teamType,
      },
      create: {
        name: teamData.name,
        description: teamData.description,
        teamType: teamData.teamType,
      },
    });
    console.log(`✓ Created/updated team: ${team.name} (${teamData.teamType})`);
  }

  console.log("✓ Team seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding teams:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
