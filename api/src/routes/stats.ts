import express from "express";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";

import { db } from "../db/index.js";
import { classes, departments, subjects, user, siteVisits } from "../db/schema/index.js";
import { clampInt } from "../lib/pagination.js";
import { cacheResponse } from "../middleware/cache.js";

const router = express.Router();

// Overview counts for core entities
router.get("/overview", cacheResponse(15000), async (req, res) => {
  try {
    const [
      usersCount,
      teachersCount,
      adminsCount,
      subjectsCount,
      departmentsCount,
      classesCount,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(user),
      db
        .select({ count: sql<number>`count(*)` })
        .from(user)
        .where(eq(user.role, "teacher")),
      db
        .select({ count: sql<number>`count(*)` })
        .from(user)
        .where(eq(user.role, "admin")),
      db.select({ count: sql<number>`count(*)` }).from(subjects),
      db.select({ count: sql<number>`count(*)` }).from(departments),
      db.select({ count: sql<number>`count(*)` }).from(classes),
    ]);

    res.status(200).json({
      data: {
        users: usersCount[0]?.count ?? 0,
        teachers: teachersCount[0]?.count ?? 0,
        admins: adminsCount[0]?.count ?? 0,
        subjects: subjectsCount[0]?.count ?? 0,
        departments: departmentsCount[0]?.count ?? 0,
        classes: classesCount[0]?.count ?? 0,
      },
    });
  } catch (error) {
    console.error("GET /stats/overview error:", error);
    res.status(500).json({ error: "Failed to fetch overview stats" });
  }
});

// Latest activity summaries
router.get("/latest", cacheResponse(15000), async (req, res) => {
  try {
    const { limit } = req.query;
    const limitPerPage = clampInt(limit, 5, 1, 20);

    const [latestClasses, latestTeachers] = await Promise.all([
      db
        .select({
          ...getTableColumns(classes),
          subject: {
            ...getTableColumns(subjects),
          },
          teacher: {
            ...getTableColumns(user),
          },
        })
        .from(classes)
        .leftJoin(subjects, eq(classes.subjectId, subjects.id))
        .leftJoin(user, eq(classes.teacherId, user.id))
        .orderBy(desc(classes.createdAt))
        .limit(limitPerPage),
      db
        .select()
        .from(user)
        .where(eq(user.role, "teacher"))
        .orderBy(desc(user.createdAt))
        .limit(limitPerPage),
    ]);

    res.status(200).json({
      data: {
        latestClasses,
        latestTeachers,
      },
    });
  } catch (error) {
    console.error("GET /stats/latest error:", error);
    res.status(500).json({ error: "Failed to fetch latest stats" });
  }
});

// Aggregates for charts
router.get("/charts", cacheResponse(30000), async (req, res) => {
  try {
    const [usersByRole, subjectsByDepartment, classesBySubject] =
      await Promise.all([
        db
          .select({
            role: user.role,
            total: sql<number>`count(*)`,
          })
          .from(user)
          .groupBy(user.role),
        db
          .select({
            departmentId: departments.id,
            departmentName: departments.name,
            totalSubjects: sql<number>`count(${subjects.id})`,
          })
          .from(departments)
          .leftJoin(subjects, eq(subjects.departmentId, departments.id))
          .groupBy(departments.id),
        db
          .select({
            subjectId: subjects.id,
            subjectName: subjects.name,
            totalClasses: sql<number>`count(${classes.id})`,
          })
          .from(subjects)
          .leftJoin(classes, eq(classes.subjectId, subjects.id))
          .groupBy(subjects.id),
      ]);

    res.status(200).json({
      data: {
        usersByRole,
        subjectsByDepartment,
        classesBySubject,
      },
    });
  } catch (error) {
    console.error("GET /stats/charts error:", error);
    res.status(500).json({ error: "Failed to fetch chart stats" });
  }
});

// Analytics tracking data
router.get("/analytics", async (req, res) => {
  try {
    const { limit = "50" } = req.query;
    const limitNum = clampInt(limit as string, 50, 1, 500);

    const visits = await db
      .select()
      .from(siteVisits)
      .orderBy(desc(siteVisits.visitedAt))
      .limit(limitNum);

    const stats = await db
      .select({
        country: siteVisits.country,
        count: sql<number>`count(*)`,
      })
      .from(siteVisits)
      .groupBy(siteVisits.country)
      .orderBy(desc(sql`count(*)`));

    res.status(200).json({
      data: {
        recentVisits: visits,
        visitsByCountry: stats,
      },
    });
  } catch (error) {
    console.error("GET /stats/analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;
