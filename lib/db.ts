import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

export const db = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

if (typeof process !== "undefined") {
  let isShuttingDown = false;
  
  const gracefulShutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    
    try {
      await db.$disconnect();
    } catch (error) {
      console.error("Error during Prisma disconnect:", error);
    }
  };
  
  if (!process.listeners("beforeExit").includes(gracefulShutdown)) {
    process.on("beforeExit", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
  }
}
