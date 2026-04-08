import { type Request, type Response, type NextFunction } from "express";
import { db } from "../db/index.js";
import { siteVisits } from "../db/schema/app.js";

/**
 * Middleware to track website visitors' analytics.
 * Captures IP, city, region, country, and timestamp.
 */
export const analyticsMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // Avoid tracking non-GET requests or internal paths if needed
  if (req.method !== "GET" || req.path.startsWith("/api/auth")) {
    return next();
  }

  // Get the IP address
  // Note: req.ip can be "::1" on localhost. 
  // In production, we usually check x-forwarded-for if behind a proxy.
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";

  // Skip geolocation for internal/loopback IPs to avoid errors from public APIs
  const isLocal = ip === "::1" || ip === "127.0.0.1";

  try {
    let geoData = {
      city: "Localhost",
      region: "Localhost",
      country: "Localhost",
    };

    if (!isLocal && ip) {
      // Using ip-api.com (Free for non-commercial use, 45 requests per minute)
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
    // Log error but don't block the request
    console.warn("Analytics tracking failed:", error instanceof Error ? error.message : error);
  }

  next();
};
