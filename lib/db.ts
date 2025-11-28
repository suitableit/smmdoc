import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Create Prisma client with proper configuration
export const db = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

// Prevent multiple instances in all environments (important for Next.js)
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = db;
}

// Handle graceful shutdown only on process exit (not per-request)
if (typeof process !== "undefined") {
  const gracefulShutdown = async () => {
    await db.$disconnect();
  };
  
  process.on("beforeExit", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
}
