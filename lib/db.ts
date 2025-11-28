import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton
 * 
 * IMPORTANT: To prevent "Too many connections" errors, configure your DATABASE_URL with connection pool parameters:
 * 
 * DATABASE_URL="mysql://user:password@host:port/database?connection_limit=10&pool_timeout=10"
 * 
 * Parameters:
 * - connection_limit: Maximum number of connections in the pool (default: 10, adjust based on your MySQL max_connections)
 * - pool_timeout: Timeout in seconds for getting a connection from the pool (default: 10)
 * 
 * Example:
 * DATABASE_URL="mysql://root:password@localhost:3306/mydb?connection_limit=10&pool_timeout=10"
 */

// Use a more robust singleton pattern that works with Turbopack
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create Prisma client
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

// Use global singleton in development, create new instance in production
// This prevents multiple Prisma Client instances in development (especially with Turbopack hot reload)
export const db = globalThis.prisma ?? createPrismaClient();

// Store in global for development (prevents multiple instances with hot reload)
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

// Handle graceful shutdown only on process exit (not per-request)
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
  
  // Only register once
  if (!process.listeners("beforeExit").includes(gracefulShutdown)) {
    process.on("beforeExit", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
  }
}
