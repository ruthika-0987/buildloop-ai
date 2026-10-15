import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db, UserRecord } from '../db';
import {
  hashPassword,
  verifyPassword,
  createSignedToken,
  setSessionCookie,
  clearSessionCookie,
  AuthenticatedRequest,
  requireAuth,
  requireRole,
  rateLimit
} from '../auth';

const router = Router();

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'That password is too short. Use at least 8 characters.'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['seller', 'buyer', 'both']).default('both'),
  language: z.enum(['en', 'te', 'hi']).default('en')
});

const signinSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

// Rate limit: 10 attempts per minute on auth routes
const authRateLimiter = rateLimit(10, 60 * 1000);

router.post('/signup', authRateLimiter, (req: Request, res: Response) => {
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return res.status(400).json({ error: issue?.message || 'Invalid input data' });
  }

  const { email, password, name, phone, role, language } = result.data;
  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const users = db.getUsers();
  // First user ever becomes admin!
  const assignedRole: UserRecord['role'] = users.length === 0 ? 'admin' : role;

  const newUser: UserRecord = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: email.toLowerCase().trim(),
    name: name.trim(),
    phone: phone?.trim(),
    passwordHash: hashPassword(password),
    role: assignedRole,
    language: language || 'en',
    created_at: new Date().toISOString()
  };

  db.createUser(newUser);

  // Sign in automatically
  const token = createSignedToken(newUser.id);
  setSessionCookie(res, token);

  const { passwordHash, ...userResponse } = newUser;
  return res.status(201).json({
    user: userResponse,
    isFirstUserAdmin: assignedRole === 'admin'
  });
});

router.post('/signin', authRateLimiter, (req: Request, res: Response) => {
  const result = signinSchema.safeParse(req.body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return res.status(400).json({ error: issue?.message || 'Invalid credentials' });
  }

  const { email, password } = result.data;
  const user = db.getUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Incorrect email or password. Please try again.' });
  }

  const token = createSignedToken(user.id);
  setSessionCookie(res, token);

  const { passwordHash, ...userResponse } = user;
  return res.json({ user: userResponse });
});

router.post('/signout', (req: AuthenticatedRequest, res: Response) => {
  const token = req.cookies?.bl_session;
  clearSessionCookie(res, token);
  return res.json({ success: true, message: 'Signed out successfully' });
});

router.get('/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  const { passwordHash, ...userResponse } = req.user;
  return res.json({ user: userResponse });
});

router.put('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { name, phone, language } = req.body;
  const updates: Partial<UserRecord> = {};
  if (name && typeof name === 'string') updates.name = name.trim();
  if (phone !== undefined) updates.phone = String(phone).trim();
  if (language && ['en', 'te', 'hi'].includes(language)) updates.language = language;

  const updated = db.updateUser(req.user!.id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { passwordHash, ...userResponse } = updated;
  return res.json({ user: userResponse });
});

// Admin only: list all users
router.get('/users', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers().map(({ passwordHash, ...u }) => u);
  return res.json({ users });
});

// Admin only: update user role (e.g. grant Inspector or Admin)
router.put('/users/:id/role', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.body;
  const allowed = ['admin', 'seller', 'buyer', 'both', 'inspector'];
  if (!allowed.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const targetId = req.params.id;
  const targetUser = db.getUserById(targetId);
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Prevent admin demoting themselves if they are the only admin
  if (targetUser.id === req.user!.id && role !== 'admin') {
    const adminCount = db.getUsers().filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
      return res.status(400).json({ error: 'Cannot demote the only remaining administrator.' });
    }
  }

  const updated = db.updateUser(targetId, { role });
  const { passwordHash, ...userResponse } = updated!;
  return res.json({ user: userResponse });
});

export default router;
