import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import fs from 'fs';
import * as schema from './schema';

let db: BetterSQLite3Database<typeof schema> | null = null;
let sqlite: Database.Database | null = null;

export function initDatabase(userDataPath: string) {
  const dbPath = path.join(userDataPath, 'goalos.db');
  fs.mkdirSync(userDataPath, { recursive: true });

  sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  db = drizzle(sqlite, { schema });

  const migrationsFolder = path.join(__dirname, 'migrations');
  if (fs.existsSync(migrationsFolder)) {
    migrate(db, { migrationsFolder });
  } else {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        due_time TEXT,
        priority TEXT NOT NULL DEFAULT 'medium',
        estimated_duration INTEGER,
        actual_duration INTEGER,
        category TEXT,
        tags TEXT NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'todo',
        goal_id TEXT,
        color TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        modified_at TEXT NOT NULL,
        completed_at TEXT
      );
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        start_date TEXT,
        target_date TEXT,
        color TEXT,
        icon TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        progress REAL NOT NULL DEFAULT 0,
        hours_invested REAL NOT NULL DEFAULT 0,
        tasks_completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        modified_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS activity_sessions (
        id TEXT PRIMARY KEY,
        application_name TEXT NOT NULL,
        window_title TEXT NOT NULL,
        process_name TEXT,
        process_id INTEGER,
        start_time TEXT NOT NULL,
        end_time TEXT,
        duration INTEGER
      );
      CREATE TABLE IF NOT EXISTS focus_sessions (
        id TEXT PRIMARY KEY,
        application_name TEXT NOT NULL,
        task_id TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT,
        duration INTEGER
      );
      CREATE TABLE IF NOT EXISTS idle_sessions (
        id TEXT PRIMARY KEY,
        start_time TEXT NOT NULL,
        end_time TEXT,
        duration INTEGER,
        reason TEXT NOT NULL DEFAULT 'inactivity'
      );
      CREATE TABLE IF NOT EXISTS daily_stats (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL UNIQUE,
        screen_time INTEGER NOT NULL DEFAULT 0,
        focus_time INTEGER NOT NULL DEFAULT 0,
        idle_time INTEGER NOT NULL DEFAULT 0,
        tasks_completed INTEGER NOT NULL DEFAULT 0,
        productivity_score REAL NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS application_usage (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        application_name TEXT NOT NULL,
        total_duration INTEGER NOT NULL DEFAULT 0,
        open_count INTEGER NOT NULL DEFAULT 0,
        average_session INTEGER NOT NULL DEFAULT 0,
        longest_session INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT
      );
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT,
        scheduled_at TEXT,
        sent_at TEXT,
        read_at TEXT
      );
    `);
  }

  return db;
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export function closeDatabase() {
  sqlite?.close();
  sqlite = null;
  db = null;
}
