import Redis from "ioredis";

// Instantiate the Redis client.
// We use process.env.REDIS_URL provided in your .env
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn("REDIS_URL is not defined. Caching may not work as expected.");
}

export const redis = new Redis(redisUrl || "", {
  tls: {
    rejectUnauthorized: false,
  },
  maxRetriesPerRequest: 3,
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});
