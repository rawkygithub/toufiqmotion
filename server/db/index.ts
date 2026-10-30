import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'blog.db');
export const db = new Database(dbPath);

// Enable WAL (Write-Ahead Logging) mode for 2026 high-concurrency reading & writing
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // 1. Users / Admins Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Articles Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      date TEXT NOT NULL,
      read_time TEXT NOT NULL,
      image TEXT NOT NULL,
      featured INTEGER DEFAULT 0,
      trending_rank INTEGER,
      author_name TEXT NOT NULL,
      author_avatar TEXT NOT NULL,
      author_role TEXT NOT NULL,
      quote TEXT,
      tags_json TEXT NOT NULL,
      content_json TEXT NOT NULL,
      views_count INTEGER DEFAULT 0,
      likes_count INTEGER DEFAULT 0,
      published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
    CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
  `);

  // 3. Comments / Reflections Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_email TEXT,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'approved', -- 'approved', 'pending', 'spam'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
  `);

  // 4. Newsletter Subscribers Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      source TEXT DEFAULT 'footer',
      status TEXT DEFAULT 'active',
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Inquiries Table (Work With Us & Contact Page Messages)
  db.exec(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL, -- 'partnership' or 'contact'
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      subject TEXT,
      project_type TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new', -- 'new', 'in_review', 'resolved'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ SQLite Database initialized with WAL mode at:', dbPath);
}

