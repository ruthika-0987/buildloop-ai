import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth';
import dataRouter from './routes/data';
import aiRouter from './routes/ai';
import iotRouter from './routes/iot';
import cloudsqlRouter from './routes/cloudsql';
import { authenticate } from './auth';
import { isAiEnabled } from './ai';

export const app = express();

// Trust reverse proxy (Cloud Run, Render)
app.set('trust proxy', 1);

// Middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());
app.use(authenticate);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'BuildLoop AI',
    motto: 'AI suggests, the engine decides, people confirm.',
    uptimeSeconds: Math.floor(process.uptime()),
    aiStatus: isAiEnabled ? 'ENABLED' : 'MANUAL_FALLBACK',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/data', dataRouter);
app.use('/api/ai', aiRouter);
app.use('/api/ingest', iotRouter);
app.use('/api/cloudsql', cloudsqlRouter);

// Central error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[SERVER ERROR]', err);
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error occurred.'
  });
});
