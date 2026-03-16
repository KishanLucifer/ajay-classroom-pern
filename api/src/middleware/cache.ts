import type { NextFunction, Request, Response } from "express";

type CacheEntry = {
  expiresAt: number;
  status: number;
  body: string;
  headers: Record<string, string>;
};

const responseCache = new Map<string, CacheEntry>();

const getCacheKey = (req: Request) => req.originalUrl ?? req.url;

export const cacheResponse =
  (ttlMs: number) => (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") return next();

    const key = getCacheKey(req);
    const cached = responseCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      res.status(cached.status);
      for (const [header, value] of Object.entries(cached.headers)) {
        res.setHeader(header, value);
      }
      return res.send(cached.body);
    }

    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    res.json = (body) => {
      const payload = JSON.stringify(body);
      responseCache.set(key, {
        expiresAt: Date.now() + ttlMs,
        status: res.statusCode,
        body: payload,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "private, max-age=5",
        },
      });
      res.setHeader("Cache-Control", "private, max-age=5");
      return originalSend(payload);
    };

    res.send = (body) => {
      if (typeof body === "string") {
        responseCache.set(key, {
          expiresAt: Date.now() + ttlMs,
          status: res.statusCode,
          body,
          headers: {
            "Cache-Control": "private, max-age=5",
          },
        });
        res.setHeader("Cache-Control", "private, max-age=5");
      }
      return originalSend(body);
    };

    return next();
  };

export const clearResponseCache = () => {
  responseCache.clear();
};
