import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db, UserRecord } from './db';

const SESSION_SECRET = process.env.SESSION_SECRET || 'buildloop-super-secure-dev-session-key-32chars';
const COOKIE_NAME = 'bl_session';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Scrypt password hashing
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// HMAC signed token: base64(token_id).base64(hmac)
export function createSignedToken(userId: string): string {
  const rawId = `${userId}.${Date.now()}.${crypto.randomBytes(16).toString('hex')}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(rawId).digest('hex');
  const token = `${Buffer.from(rawId).toString('base64url')}.${hmac}`;

  db.createSession({
    token,
    userId,
    expiresAt: Date.now() + SESSION_MAX_AGE_MS
  });

  return token;
}

export function verifySignedToken(token: string): string | null {
  try {
    const [rawB64, hmac] = token.split('.');
    if (!rawB64 || !hmac) return null;
    const rawId = Buffer.from(rawB64, 'base64url').toString('utf-8');
    const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(rawId).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
      return null;
    }

    const session = db.getSession(token);
    if (!session) return null;

    return session.userId;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_MS,
    path: '/'
  });
}

export function clearSessionCookie(res: Response, token?: string) {
  if (token) {
    db.deleteSession(token);
  }
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
}

// Request extension
export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME] || req.headers.authorization?.replace(/^Bearer\s+/, '');
  if (!token) {
    req.user = undefined;
    return next();
  }

  const userId = verifySignedToken(token);
  if (!userId) {
    req.user = undefined;
    return next();
  }

  const user = db.getUserById(userId);
  req.user = user;
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

export function requireRole(allowedRoles: Array<UserRecord['role']>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }
    // Admin always has super permissions
    if (req.user.role === 'admin' || allowedRoles.includes(req.user.role)) {
      return next();
    }
    // 'both' can act as seller or buyer
    if (req.user.role === 'both' && (allowedRoles.includes('seller') || allowedRoles.includes('buyer'))) {
      return next();
    }
    return res.status(403).json({ error: `Permission denied. Requires role: ${allowedRoles.join(', ')}` });
  };
}

// In-memory sliding window rate limiter
const rateLimits: Map<string, { count: number; resetAt: number }> = new Map();

export function rateLimit(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    const record = rateLimits.get(key);
    if (!record || record.resetAt < now) {
      rateLimits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= limit) {
      const waitSeconds = Math.ceil((record.resetAt - now) / 1000);
      return res.status(429).json({
        error: `Too many requests. Please wait ${waitSeconds} seconds before trying again.`
      });
    }

    record.count++;
    next();
  };
}
