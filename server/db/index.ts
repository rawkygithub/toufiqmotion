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

  // 2. Categories Table (Requirement 1)
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT DEFAULT 'Compass',
      image TEXT,
      subcategories_json TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
  `);

  // 3. Articles Table with SEO & Rich Content support
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
      html_content TEXT,
      focus_keyword TEXT,
      meta_title TEXT,
      meta_description TEXT,
      canonical_url TEXT,
      no_index INTEGER DEFAULT 0,
      og_image TEXT,
      seo_score INTEGER DEFAULT 85,
      readability_score INTEGER DEFAULT 90,
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

  // Ensure columns exist if table was already created earlier
  const alterColumns = [
    'ALTER TABLE articles ADD COLUMN html_content TEXT;',
    'ALTER TABLE articles ADD COLUMN focus_keyword TEXT;',
    'ALTER TABLE articles ADD COLUMN meta_title TEXT;',
    'ALTER TABLE articles ADD COLUMN meta_description TEXT;',
    'ALTER TABLE articles ADD COLUMN canonical_url TEXT;',
    'ALTER TABLE articles ADD COLUMN no_index INTEGER DEFAULT 0;',
    'ALTER TABLE articles ADD COLUMN og_image TEXT;',
    'ALTER TABLE articles ADD COLUMN seo_score INTEGER DEFAULT 85;',
    'ALTER TABLE articles ADD COLUMN readability_score INTEGER DEFAULT 90;'
  ];

  for (const sql of alterColumns) {
    try {
      db.exec(sql);
    } catch {
      // Column already exists, safe to ignore
    }
  }

  // 4. Comments Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_email TEXT,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'approved',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
  `);

  // 5. Newsletter Subscribers Table
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

  // 6. Inquiries Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      subject TEXT,
      project_type TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 7. SEO 301/302 Redirects Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS seo_redirects (
      id TEXT PRIMARY KEY,
      source_path TEXT UNIQUE NOT NULL,
      target_path TEXT NOT NULL,
      redirect_code INTEGER DEFAULT 301,
      hits_count INTEGER DEFAULT 0,
      notes TEXT,
      last_accessed DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_seo_redirects_source ON seo_redirects(source_path);
  `);

  // 8. SEO 404 Crawl Error Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS seo_crawl_errors (
      id TEXT PRIMARY KEY,
      path TEXT UNIQUE NOT NULL,
      hits_count INTEGER DEFAULT 1,
      referer TEXT,
      user_agent TEXT,
      ip TEXT,
      status TEXT DEFAULT 'active',
      last_detected DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_seo_crawl_errors_path ON seo_crawl_errors(path);
  `);

  // 9. SEO Global Settings & Knowledge Graph Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS seo_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 10. SEO Search Console Queries & Analytics Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS seo_search_queries (
      id TEXT PRIMARY KEY,
      query TEXT UNIQUE NOT NULL,
      clicks INTEGER DEFAULT 0,
      impressions INTEGER DEFAULT 0,
      ctr REAL DEFAULT 0.0,
      position REAL DEFAULT 1.0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 11. SEO Instant Indexing Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS seo_indexing_logs (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      engine TEXT NOT NULL,
      action TEXT NOT NULL,
      response_status INTEGER DEFAULT 200,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ SQLite Database schema initialized with Categories & Yoast SEO Command Center tables at:', dbPath);
}
