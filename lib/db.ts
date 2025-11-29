import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Parse DATABASE_URL and add connection pool parameters if not present
  let connectionString = databaseUrl;
  
  // Add connection pool parameters for MySQL (Prisma uses connection_limit parameter)
  if (!connectionString.includes("connection_limit")) {
    const separator = connectionString.includes("?") ? "&" : "?";
    // Use smaller pool size to prevent too many connections
    // Default pool size of 10 should be sufficient for most applications
    const poolSize = process.env.DATABASE_POOL_SIZE || "10";
    
    connectionString = `${connectionString}${separator}connection_limit=${poolSize}`;
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });
};

// Ensure only one Prisma instance exists (singleton pattern)
export const db = globalThis.prisma ?? createPrismaClient();

// In development, use global variable to prevent multiple instances during hot-reload
// In production, the singleton pattern still applies
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
} else {
  // In production, ensure we reuse the same instance
  if (!globalThis.prisma) {
    globalThis.prisma = db;
  }
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
