import { type Request, type Response, type NextFunction } from "express";
import { db } from "../db/index.js";
import { siteVisits } from "../db/schema/app.js";

/**
 * Middleware to track website visitors' analytics.
 * Captures IP, city, region, country, and timestamp.
 * Runs in the background (NON-BLOCKING) to ensure fast responses.
 */
export const analyticsMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // 1. Immediately call next() so the user doesn't have to wait for tracking!
  next();

  // 2. Perform the tracking in the background
  (async () => {
    // Avoid tracking non-GET requests or internal paths
    if (req.method !== "GET" || req.path.startsWith("/api/auth")) {
      return;
    }

    // Get the IP address
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    const isLocal = ip === "::1" || ip === "127.0.0.1";

    try {
      let geoData = {
        city: "Localhost",
        region: "Localhost",
        country: "Localhost",
      };

      if (!isLocal && ip) {
        // Fetch geolocation from ip-api.com
        const response = await fetch(`http://ip-api.com/json/${ip.split(",")[0]}`);
        if (response.ok) {
          const data = (await response.json()) as {
            status: string;
            city?: string;
            regionName?: string;
            country?: string;
          };
          if (data.status === "success") {
            geoData = {
              city: data.city || "Unknown",
              region: data.regionName || "Unknown",
              country: data.country || "Unknown",
            };
          }
        }
      }

      // Insert record into PostgreSQL via Drizzle
      await db.insert(siteVisits).values({
        ipAddress: ip.split(",")[0],
        city: geoData.city,
        region: geoData.region,
        country: geoData.country,
        userAgent: req.headers["user-agent"],
        path: req.originalUrl || req.path,
      });
    } catch (error) {
      // Background logging for errors
      console.warn("Analytics background tracking failed:", error instanceof Error ? error.message : error);
    }
  })();
};
