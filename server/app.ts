import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";
import dataRouter from "./routes/data";
import aiRouter from "./routes/ai";
import iotRouter from "./routes/iot";
import cloudsqlRouter from "./routes/cloudsql";
import { authenticate } from "./auth";
import { isAiEnabled } from "./ai";

export const app = express();

// Trust reverse proxy (Cloud Run, Render)
app.set("trust proxy", 1);

const allowedOrigins = new Set(
  (process.env.FRONTEND_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.add("http://localhost:3000");
  allowedOrigins.add("http://localhost:5173");
}

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.get("origin");
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Device-Key",
    );
    res.vary("Origin");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Middleware
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());
app.use(authenticate);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    app: "BuildLoop AI",
    motto: "AI suggests, the engine decides, people confirm.",
    uptimeSeconds: Math.floor(process.uptime()),
    aiStatus: isAiEnabled ? "ENABLED" : "MANUAL_FALLBACK",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/data", dataRouter);
app.use("/api/ai", aiRouter);
app.use("/api/ingest", iotRouter);
app.use("/api/cloudsql", cloudsqlRouter);

// Central error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[SERVER ERROR]", err);
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: err.message || "Internal server error occurred.",
  });
});
