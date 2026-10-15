import fs from 'fs';
import path from 'path';

export interface DbRecord {
  id: string;
  collection: string;
  data: any;
  updated_at: string;
  updated_by: string;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  phone?: string;
  passwordHash: string;
  role: 'admin' | 'seller' | 'buyer' | 'both' | 'inspector';
  language: 'en' | 'te' | 'hi';
  created_at: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  expiresAt: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'buildloop.json');

interface StorageSchema {
  version: number;
  lastUpdated: string;
  users: UserRecord[];
  sessions: SessionRecord[];
  records: Record<string, DbRecord>; // key: `${collection}:${id}`
}

let memoryStorage: StorageSchema = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  users: [],
  sessions: [],
  records: {}
};

function ensureDirSync(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadStorage(): StorageSchema {
  try {
    ensureDirSync(DATA_DIR);
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.version === 'number') {
        memoryStorage = parsed;
        return memoryStorage;
      }
    }
  } catch (err) {
    console.warn('[DB] Could not load persisted data file, initializing in-memory:', err);
  }
  saveStorage();
  return memoryStorage;
}

function saveStorage() {
  try {
    ensureDirSync(DATA_DIR);
    memoryStorage.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStorage, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to save storage file:', err);
  }
}

// Initial load
loadStorage();

export const db = {
  // Version for polling sync
  getVersion(): { version: number; lastUpdated: string } {
    return {
      version: memoryStorage.version,
      lastUpdated: memoryStorage.lastUpdated
    };
  },

  incrementVersion() {
    memoryStorage.version += 1;
    memoryStorage.lastUpdated = new Date().toISOString();
    saveStorage();
  },

  // Users
  getUsers(): UserRecord[] {
    return memoryStorage.users;
  },

  getUserById(id: string): UserRecord | undefined {
    return memoryStorage.users.find(u => u.id === id);
  },

  getUserByEmail(email: string): UserRecord | undefined {
    return memoryStorage.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  createUser(user: UserRecord): UserRecord {
    memoryStorage.users.push(user);
    this.incrementVersion();
    return user;
  },

  updateUser(id: string, updates: Partial<UserRecord>): UserRecord | undefined {
    const user = memoryStorage.users.find(u => u.id === id);
    if (!user) return undefined;
    Object.assign(user, updates);
    this.incrementVersion();
    return user;
  },

  // Sessions
  createSession(session: SessionRecord) {
    // cleanup expired
    const now = Date.now();
    memoryStorage.sessions = memoryStorage.sessions.filter(s => s.expiresAt > now);
    memoryStorage.sessions.push(session);
    saveStorage();
  },

  getSession(token: string): SessionRecord | undefined {
    const now = Date.now();
    const session = memoryStorage.sessions.find(s => s.token === token && s.expiresAt > now);
    return session;
  },

  deleteSession(token: string) {
    memoryStorage.sessions = memoryStorage.sessions.filter(s => s.token !== token);
    saveStorage();
  },

  // Generic Records
  getAllRecords(): Record<string, DbRecord[]> {
    const collections: Record<string, DbRecord[]> = {
      batches: [],
      demands: [],
      orders: [],
      events: [],
      testReports: [],
      alerts: [],
      audit: [],
      sensor_readings: []
    };

    for (const rec of Object.values(memoryStorage.records)) {
      if (!collections[rec.collection]) {
        collections[rec.collection] = [];
      }
      collections[rec.collection].push(rec);
    }
    return collections;
  },

  getRecordsByCollection(collection: string): DbRecord[] {
    return Object.values(memoryStorage.records).filter(r => r.collection === collection);
  },

  getRecord(collection: string, id: string): DbRecord | undefined {
    return memoryStorage.records[`${collection}:${id}`];
  },

  upsertRecord(rec: DbRecord) {
    memoryStorage.records[`${rec.collection}:${rec.id}`] = rec;
    this.incrementVersion();
  },

  deleteRecord(collection: string, id: string) {
    delete memoryStorage.records[`${collection}:${id}`];
    this.incrementVersion();
  },

  replaceRecords(newRecords: Record<string, DbRecord>) {
    memoryStorage.records = newRecords;
    this.incrementVersion();
  },

  clearCollection(collection: string) {
    for (const key of Object.keys(memoryStorage.records)) {
      if (key.startsWith(`${collection}:`)) {
        delete memoryStorage.records[key];
      }
    }
    this.incrementVersion();
  },

  clearSampleData() {
    for (const [key, rec] of Object.entries(memoryStorage.records)) {
      if (rec.data && (rec.data.isSample === true || rec.data.sample === true)) {
        delete memoryStorage.records[key];
      }
    }
    this.incrementVersion();
  }
};
