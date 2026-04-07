import type { NextFunction, Request, Response } from "express";
import { redis } from "../lib/redis.js";

type CacheEntry = {
  status: number;
  body: string;
  headers: Record<string, string>;
};

const getCacheKey = (req: Request) => `api-cache:${req.originalUrl ?? req.url}`;

export const cacheResponse =
  (ttlMs: number) => async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") return next();

    const key = getCacheKey(req);

    try {
      const cachedData = await redis.get(key);
      if (cachedData) {
        const cached: CacheEntry = JSON.parse(cachedData);
        res.status(cached.status);
        for (const [header, value] of Object.entries(cached.headers)) {
          res.setHeader(header, value);
        }
        return res.send(cached.body);
      }
    } catch (err) {
      console.warn("Redis GET error:", err);
    }

    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    const ttlSeconds = Math.floor(ttlMs / 1000);

    res.json = (body) => {
      const payload = JSON.stringify(body);
      const cacheEntry: CacheEntry = {
        status: res.statusCode,
        body: payload,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "private, max-age=5",
        },
      };

      redis.setex(key, ttlSeconds, JSON.stringify(cacheEntry)).catch((err) => {
        console.warn("Redis SETEX error:", err);
      });

      res.setHeader("Cache-Control", "private, max-age=5");
      return originalSend(payload);
    };

    res.send = (body) => {
      if (typeof body === "string") {
        const cacheEntry: CacheEntry = {
          status: res.statusCode,
          body,
          headers: {
            "Cache-Control": "private, max-age=5",
          },
        };

        redis.setex(key, ttlSeconds, JSON.stringify(cacheEntry)).catch((err) => {
          console.warn("Redis SETEX error:", err);
        });

        res.setHeader("Cache-Control", "private, max-age=5");
      }
      return originalSend(body);
    };

    return next();
  };

export const clearResponseCache = async () => {
  try {
    const keys = await redis.keys("api-cache:*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.warn("Error clearing Redis cache:", err);
  }
};
