import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requireAuth, rateLimit } from '../auth';
import { analyzePhotosWithGemini, explainMatchWithGemini } from '../ai';

const router = Router();

const photoAnalysisSchema = z.object({
  base64Images: z.array(
    z.object({
      mimeType: z.string().default('image/jpeg'),
      data: z.string().min(10, 'Invalid image data')
    })
  ).min(1, 'Please upload at least 1 image').max(6, 'Maximum 6 images allowed per batch'),
  context: z.string().optional()
});

// Rate limit: 15 AI calls per minute per user/IP
const aiRateLimiter = rateLimit(15, 60 * 1000);

router.post('/analyze-photos', requireAuth, aiRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  const parseResult = photoAnalysisSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      source: 'unavailable',
      reason: parseResult.error.issues[0]?.message || 'Invalid image payload'
    });
  }

  const { base64Images, context } = parseResult.data;
  const analysis = await analyzePhotosWithGemini(base64Images, context);
  return res.json(analysis);
});

router.post('/explain-match', requireAuth, aiRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  const matchData = req.body;
  if (!matchData || typeof matchData !== 'object') {
    return res.status(400).json({ source: 'unavailable', reason: 'Invalid match data' });
  }

  const explanation = await explainMatchWithGemini(matchData);
  return res.json(explanation);
});

export default router;
