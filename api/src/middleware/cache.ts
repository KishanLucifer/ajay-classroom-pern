import type { NextFunction, Request, Response } from "express";
import { redis } from "../lib/redis.js";

type CacheEntry = {
  status: number;
  body: string;
  headers: Record<string, string>;
};

const getCacheKey = (req: Request) => `cache:${req.originalUrl ?? req.url}`;

export const cacheResponse =
  (ttlMs: number) => async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") return next();

    const key = getCacheKey(req);
    try {
      const cached = await redis.get(key);
      if (cached) {
        const parsed = JSON.parse(cached) as CacheEntry;
        res.status(parsed.status);
        for (const [header, value] of Object.entries(parsed.headers)) {
          res.setHeader(header, value);
        }
        res.setHeader("X-Cache", "HIT");
        return res.send(parsed.body);
      }
    } catch (error) {
      console.error("Redis cache get error:", error);
    }

    const originalSend = res.send.bind(res);

    res.send = (body) => {
      const payload = typeof body === "string" ? body : JSON.stringify(body);
      
      const headers: Record<string, string> = {
        "Content-Type": res.get("Content-Type") || "application/json; charset=utf-8",
      };

      const entry: CacheEntry = {
        status: res.statusCode,
        body: payload,
        headers,
      };

      redis.set(key, JSON.stringify(entry), "PX", ttlMs).catch((err) => {
        console.error("Redis cache set error:", err);
      });

      res.setHeader("X-Cache", "MISS");
      return originalSend(body);
    };

    return next();
  };

export const clearResponseCache = async () => {
  try {
    const keys = await redis.keys("cache:*");
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Cleared ${keys.length} cache keys`);
    }
  } catch (error) {
    console.error("Redis cache clear error:", error);
  }
};
