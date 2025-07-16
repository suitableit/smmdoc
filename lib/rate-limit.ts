// Simple in-memory rate limiting
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;

  // Clean up expired entries
  if (store[key] && now > store[key].resetTime) {
    delete store[key];
  }

  // Initialize or get current count
  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  // Check if limit exceeded
  if (store[key].count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: store[key].resetTime,
    };
  }

  // Increment count
  store[key].count++;

  return {
    success: true,
    remaining: limit - store[key].count,
    resetTime: store[key].resetTime,
  };
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key] && now > store[key].resetTime) {
      delete store[key];
    }
  });
}, 60000); // Clean every minute
