// import "dotenv/config";
// import { drizzle } from "drizzle-orm/neon-http";
// import { neon } from "@neondatabase/serverless";

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL is not defined");
// }

// const sql = neon(process.env.DATABASE_URL);
// export const db = drizzle(sql);
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export const db = drizzle(pool);

const withTimeout = async <T>(promise: Promise<T>, ms: number) => {
  let timeoutId: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Database warmup timed out after ${ms}ms`));
    }, ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

export const warmDb = async (retries = 3, delayMs = 500) => {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      await withTimeout(pool.query("select 1"), 4000);
      return;
    } catch (error) {
      attempt += 1;
      if (attempt > retries) {
        throw error;
      }

      const backoff = delayMs * 2 ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
};
