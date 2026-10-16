import { db } from "./index.ts";
import {
  users,
  cd_batches,
  cd_demands,
  cd_orders,
  sync_logs,
} from "./schema.ts";
import { eq, desc } from "drizzle-orm";

export async function getOrCreateUser(
  uid: string,
  email: string,
  name?: string,
  phone?: string,
) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        name: name || null,
        phone: phone || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(name ? { name } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Database getOrCreateUser failed:", error);
    throw new Error("Database getOrCreateUser failed", { cause: error });
  }
}

export async function getUsers() {
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error("Database getUsers failed:", error);
    throw new Error("Database query failed. Please try again later.", {
      cause: error,
    });
  }
}

export async function syncBatchToPostgres(batch: any) {
  try {
    await db
      .insert(cd_batches)
      .values({
        id: String(batch.id),
        title: String(batch.title || "Untitled Batch"),
        materialType: String(batch.materialType || "Mixed C&D"),
        materialSubtype: String(batch.materialSubtype || "Standard"),
        quantity: Number(batch.quantity || 0),
        unit: String(batch.unit || "tons"),
        pricePerUnit: Number(batch.pricePerUnit || 0),
        locationName: String(batch.locationName || "Hyderabad"),
        latitude: String(batch.latitude || "17.4"),
        longitude: String(batch.longitude || "78.4"),
        status: String(batch.status || "available"),
      })
      .onConflictDoUpdate({
        target: cd_batches.id,
        set: {
          status: String(batch.status || "available"),
          quantity: Number(batch.quantity || 0),
        },
      });

    await db.insert(sync_logs).values({
      action: "sync_batch",
      details: `Batch ${batch.id} synced to Cloud SQL`,
    });
  } catch (err) {
    console.warn("Sync batch to Cloud SQL warning:", err);
  }
}

export async function getCloudSqlStats() {
  const hasConnectionConfig = Boolean(
    process.env.DATABASE_URL ||
    (process.env.SQL_HOST &&
      process.env.SQL_USER &&
      process.env.SQL_PASSWORD &&
      process.env.SQL_DB_NAME),
  );
  if (!hasConnectionConfig) {
    throw new Error(
      "PostgreSQL is not configured. Set DATABASE_URL or all required SQL_* variables.",
    );
  }

  try {
    const allUsers = await db.select().from(users);
    const allBatches = await db.select().from(cd_batches);
    const allDemands = await db.select().from(cd_demands);
    const allOrders = await db.select().from(cd_orders);
    const allLogs = await db
      .select()
      .from(sync_logs)
      .orderBy(desc(sync_logs.createdAt))
      .limit(10);

    return {
      userCount: allUsers.length,
      batchCount: allBatches.length,
      demandCount: allDemands.length,
      orderCount: allOrders.length,
      recentLogs: allLogs,
    };
  } catch (error) {
    console.error("Failed to get Cloud SQL stats:", error);
    throw new Error(
      "PostgreSQL is configured but unavailable. Check connectivity and required tables.",
      { cause: error },
    );
  }
}
