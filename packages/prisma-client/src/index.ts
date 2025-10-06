import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// Optional helper: gracefully handle SIGINT (for dev servers)
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
