import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  let connectionString = databaseUrl;
  
  // Configure connection pooling for MySQL
  // Prisma handles connection pooling internally, but we can limit connections via connection string
  // For MySQL, use connection_limit to limit max connections per PrismaClient instance
  if (!connectionString.includes("connection_limit") && !connectionString.includes("pool_timeout")) {
    const separator = connectionString.includes("?") ? "&" : "?";
    // Conservative pool size - adjust based on your MySQL max_connections setting
    const poolSize = process.env.DATABASE_POOL_SIZE || "3"; // Reduced to 3 to prevent too many connections
    const poolTimeout = process.env.DATABASE_POOL_TIMEOUT || "10";
    
    connectionString = `${connectionString}${separator}connection_limit=${poolSize}&pool_timeout=${poolTimeout}`;
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

// Ensure only one instance is created and reused
// Always use global instance to prevent multiple PrismaClient instances
if (!globalThis.prisma) {
  globalThis.prisma = createPrismaClient();
}

export const db = globalThis.prisma;

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
