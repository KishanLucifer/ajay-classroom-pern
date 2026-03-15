import { slidingWindow } from "@arcjet/node";
import type { ArcjetNodeRequest } from "@arcjet/node";
import type { NextFunction, Request, Response } from "express";

import aj from "../config/arcjet.js";

const rateLimitClients = {
  admin: aj.withRule(
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 20,
    })
  ),
  teacher: aj.withRule(
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 10,
    })
  ),
  student: aj.withRule(
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 10,
    })
  ),
  guest: aj.withRule(
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 5,
    })
  ),
};

const securityMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If NODE_ENV is TEST, skip security middleware
  if (process.env.NODE_ENV === "test") {
    return next();
  }

  try {
    const role: RateLimitRole = req.user?.role ?? "guest";

    let message: string;

    switch (role) {
      case "admin":
        message = "Admin request limit exceeded (20 per minute). Slow down!";
        break;
      case "teacher":
      case "student":
        message = "User request limit exceeded (10 per minute). Please wait.";
        break;
      default:
        message =
          "Guest request limit exceeded (5 per minute). Please sign up for higher limits.";
        break;
    }

    const client = rateLimitClients[role] ?? rateLimitClients.guest;

    const arcjetRequest: ArcjetNodeRequest = {
      headers: req.headers,
      method: req.method,
      url: req.originalUrl ?? req.url,
      socket: {
        remoteAddress: req.socket.remoteAddress ?? req.ip ?? "0.0.0.0",
      },
    };

    const decision = await client.protect(arcjetRequest);

    if (decision.isDenied() && decision.reason.isBot()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Automated requests are not allowed",
      });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Request blocked by security policy",
      });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      return res.status(429).json({
        error: "Too Many Requests",
        message,
      });
    }

    next();
  } catch (error) {
    console.error("Arcjet middleware error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Something went wrong with the security middleware.",
    });
  }
};

export default securityMiddleware;
