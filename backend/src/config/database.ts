import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../', process.env.DB_PATH || 'data/planner.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database;

// Helper to save database to file
export function saveDatabase(): void {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Initialize database
async function initDatabase(): Promise<Database> {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      nickname TEXT DEFAULT '规划者',
      avatar TEXT DEFAULT '',
      theme TEXT DEFAULT 'system',
      status INTEGER DEFAULT 1 CHECK(status IN (0, 1)),
      last_login_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      plan_date DATE NOT NULL,
      reminder_time TIME,
      is_completed INTEGER DEFAULT 0 CHECK(is_completed IN (0, 1)),
      reminder_enabled INTEGER DEFAULT 1 CHECK(reminder_enabled IN (0, 1)),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_plans_user_date ON plans(user_id, plan_date);`);

  db.run(`
    CREATE TABLE IF NOT EXISTS operation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id INTEGER,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      revoked_at DATETIME,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);`);

  // Initialize default system settings
  const defaultSettings: [string, string][] = [
    ['site_name', '每日规划'],
    ['allow_register', 'true'],
    ['default_role', 'user'],
    ['token_expires_hours', '24'],
    ['allow_multi_login', 'true'],
    ['default_reminder_enabled', 'true']
  ];

  defaultSettings.forEach(([key, value]) => {
    db.run('INSERT OR IGNORE INTO system_settings (key, value) VALUES (?, ?)', [key, value]);
  });

  saveDatabase();
  console.log('Database initialized successfully');
  return db;
}

// Database wrapper to match better-sqlite3 API
export function prepare(sql: string) {
  return {
    run: (...params: any[]) => {
      db.run(sql, params);
      saveDatabase();
      // Get last insert rowid
      const result = db.exec("SELECT last_insert_rowid() as id");
      const lastId = result[0]?.values[0]?.[0] || 0;
      return { lastInsertRowid: lastId };
    },
    get: (...params: any[]) => {
      // Replace ? with numbered params for sql.js
      let indexedSql = sql;
      params.forEach((p, i) => {
        indexedSql = indexedSql.replace('?', `$${i + 1}`);
      });
      const stmt = db.prepare(indexedSql);
      stmt.bind(params);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
      }
      stmt.free();
      return undefined;
    },
    all: (...params: any[]) => {
      // Replace ? with numbered params for sql.js
      let indexedSql = sql;
      params.forEach((p, i) => {
        indexedSql = indexedSql.replace('?', `$${i + 1}`);
      });
      const stmt = db.prepare(indexedSql);
      stmt.bind(params);
      const results: any[] = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    }
  };
}

let dbInitPromise: Promise<Database>;

export function initialize(): Promise<Database> {
  if (db) return Promise.resolve(db);
  if (!dbInitPromise) {
    dbInitPromise = initDatabase();
  }
  return dbInitPromise;
}

// Export default for compatibility
export default {
  prepare: (sql: string) => ({
    run: (...params: any[]) => {
      if (!db) throw new Error('Database not initialized');
      return prepare(sql).run(...params);
    },
    get: (...params: any[]) => {
      if (!db) throw new Error('Database not initialized');
      return prepare(sql).get(...params);
    },
    all: (...params: any[]) => {
      if (!db) throw new Error('Database not initialized');
      return prepare(sql).all(...params);
    }
  }),
  exec: (sql: string) => {
    if (!db) throw new Error('Database not initialized');
    return db.exec(sql);
  }
};