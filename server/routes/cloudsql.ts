import { Router, Request, Response } from "express";
import {
  getCloudSqlStats,
  getOrCreateUser,
  getUsers,
} from "../../src/db/users.ts";

const router = Router();

// GET /api/cloudsql/stats - Returns PostgreSQL instance statistics and counts
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const stats = await getCloudSqlStats();
    res.json({
      status: "online",
      provider: process.env.SQL_HOST
        ? "Google Cloud SQL (PostgreSQL)"
        : "PostgreSQL",
      database: process.env.SQL_DB_NAME || "configured database",
      stats,
    });
  } catch (error: any) {
    res.status(503).json({
      status: "unavailable",
      error: error.message || "Failed to query PostgreSQL",
    });
  }
});

// GET /api/cloudsql/users - Lists users from Cloud SQL
router.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch users from Cloud SQL" });
  }
});

// POST /api/cloudsql/sync-user - Upserts user into Cloud SQL
router.post("/sync-user", async (req: Request, res: Response) => {
  try {
    const { uid, email, name, phone } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: "uid and email are required" });
    }
    const user = await getOrCreateUser(uid, email, name, phone);
    res.json({ success: true, user });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to sync user to Cloud SQL" });
  }
});

export default router;
