import "dotenv/config";
import("apminsight")
  .then(({ default: AgentAPI }) => AgentAPI.config())
  .catch(() => console.log("APM not available in this environment"));

import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import subjectsRouter from "./routes/subjects.js";
import usersRouter from "./routes/users.js";
import classesRouter from "./routes/classes.js";
import departmentsRouter from "./routes/departments.js";
import statsRouter from "./routes/stats.js";
import enrollmentsRouter from "./routes/enrollments.js";

import { auth } from "./lib/auth.js";
import securityMiddleware from "./middleware/security.js";
import { warmDb } from "./db/index.js";
import { clearResponseCache } from "./middleware/cache.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use(securityMiddleware);
app.use((req, _res, next) => {
  if (req.method !== "GET") {
    clearResponseCache();
  }
  next();
});

app.use("/api/subjects", subjectsRouter);
app.use("/api/users", usersRouter);
app.use("/api/classes", classesRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/enrollments", enrollmentsRouter);

app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

warmDb()
  .then(() => console.log("Database warmed"))
  .catch((error) =>
    console.warn(
      "Database warmup failed:",
      error instanceof Error ? error.message : error
    )
  );
