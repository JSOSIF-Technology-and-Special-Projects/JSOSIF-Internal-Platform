import { PrismaClient } from "../src/generated/prisma/client";
import { config } from "dotenv";
import { join } from "path";

// Load environment variables from .env file in project root
// When running from project root, this will find .env
config({ path: join(process.cwd(), ".env") });

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding roles...");

  // Create Member role
  const memberRole = await prisma.role.upsert({
    where: { name: "Member" },
    update: {},
    create: {
      name: "Member",
      description: "Standard member role with basic permissions",
    },
  });

  console.log("Created Member role:", memberRole);

  // Create Admin role
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: {
      name: "Admin",
      description: "Administrator role with full permissions",
    },
  });

  console.log("Created Admin role:", adminRole);

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
