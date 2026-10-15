import { Router, Response } from 'express';
import { db, DbRecord } from '../db';
import { AuthenticatedRequest, requireAuth, requireRole } from '../auth';
import { generateSeedData } from '../seedData';

const router = Router();

// Auto-seed if db has 0 records on start
const existingRecords = db.getAllRecords();
const hasAnyRecords = Object.values(existingRecords).some(arr => arr.length > 0);
if (!hasAnyRecords) {
  const seed = generateSeedData('sys_admin');
  db.replaceRecords(seed);
  console.log('[DB] Auto-seeded initial Hyderabad pilot records.');
}

// 1. Get all collections and current version
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const collections = db.getAllRecords();
  const { version, lastUpdated } = db.getVersion();
  res.json({
    collections,
    version,
    lastUpdated
  });
});

// 2. Fast version check for 5-second polling
router.get('/version', (req: AuthenticatedRequest, res: Response) => {
  const { version, lastUpdated } = db.getVersion();
  res.json({ version, lastUpdated });
});

// 3. Merge-upsert changes
router.post('/changes', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { changes } = req.body;

  if (!Array.isArray(changes)) {
    return res.status(400).json({ error: 'Expected changes array' });
  }

  const nowIso = new Date().toISOString();

  for (const item of changes) {
    const { id, collection, data, action } = item;
    if (!id || !collection) continue;

    // Check Role Rules on Server
    if (collection === 'batches') {
      if (user.role === 'buyer') {
        return res.status(403).json({ error: 'Buyers cannot create or update batches. Please switch to Seller or Both.' });
      }
      // Actor id must belong to current user if new
      if (!data.sellerId) {
        data.sellerId = user.id;
        data.sellerName = user.name;
      }
      // Check L3 Trust level assignment: only inspector or admin can set L3
      if (data.trustLevel === 'L3' && user.role !== 'admin' && user.role !== 'inspector') {
        return res.status(403).json({ error: 'Only a certified Inspector or Administrator can award L3 Inspection Verified.' });
      }
    }

    if (collection === 'demands') {
      if (user.role === 'seller') {
        return res.status(403).json({ error: 'Sellers cannot post demands. Please switch to Buyer or Both.' });
      }
      if (!data.buyerId) {
        data.buyerId = user.id;
        data.buyerName = user.name;
      }
    }

    if (collection === 'orders') {
      // Inspection gate validation
      if (data.preDispatchGate?.inspectionPassed && user.role !== 'admin' && user.role !== 'inspector') {
        // verify if it was already passed
        const existing = db.getRecord('orders', id);
        if (!existing?.data?.preDispatchGate?.inspectionPassed) {
          return res.status(403).json({ error: 'Only an Inspector or Administrator can sign off on pre-dispatch inspection.' });
        }
      }
    }

    if (action === 'delete') {
      // Only admin or owner can delete
      const existing = db.getRecord(collection, id);
      if (existing) {
        if (user.role !== 'admin' && existing.updated_by !== user.id) {
          return res.status(403).json({ error: 'You do not have permission to delete this record.' });
        }
        db.deleteRecord(collection, id);
      }
    } else {
      // Upsert
      const record: DbRecord = {
        id,
        collection,
        data,
        updated_at: nowIso,
        updated_by: user.id
      };
      db.upsertRecord(record);
    }
  }

  const { version, lastUpdated } = db.getVersion();
  return res.json({ success: true, version, lastUpdated });
});

// 4. Admin replace all data
router.post('/replace', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { records } = req.body;
  if (!records || typeof records !== 'object') {
    return res.status(400).json({ error: 'Invalid records format' });
  }
  db.replaceRecords(records);
  const { version, lastUpdated } = db.getVersion();
  return res.json({ success: true, version, lastUpdated });
});

// 5. Admin clear sample data
router.post('/clear-sample', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  db.clearSampleData();
  const { version, lastUpdated } = db.getVersion();
  return res.json({ success: true, message: 'Sample records cleared successfully', version, lastUpdated });
});

// 6. Admin reset to sample data
router.post('/reset-sample', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const seed = generateSeedData(req.user!.id);
  db.replaceRecords(seed);
  const { version, lastUpdated } = db.getVersion();
  return res.json({ success: true, message: 'Reset to standard Hyderabad pilot sample data', version, lastUpdated });
});

export default router;
