import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import postsRoutes from './routes/posts.js';
import commentsRoutes from './routes/comments.js';
import newsletterRoutes from './routes/newsletter.js';
import inquiriesRoutes from './routes/inquiries.js';
import mediaRoutes from './routes/media.js';
import statsRoutes from './routes/stats.js';
import categoriesRoutes from './routes/categories.js';
import seoRoutes from './routes/seo.js';
import settingsRoutes from './routes/settings.js';
import { db } from './db/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Middlewares
app.use(compression({ level: 6, threshold: 1024 }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory with 30-day browser caching
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '30d'
}));

// SEO 301/302 Redirects Middleware (Engineered for zero link-juice loss)
app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    const cleanPath = req.path.toLowerCase();
    try {
      const redirect = db.prepare('SELECT * FROM seo_redirects WHERE LOWER(source_path) = ?').get(cleanPath) as any;
      if (redirect) {
        db.prepare("UPDATE seo_redirects SET hits_count = hits_count + 1, last_accessed = CURRENT_TIMESTAMP WHERE id = ?").run(redirect.id);
        return res.redirect(redirect.redirect_code || 301, redirect.target_path);
      }
    } catch {
      // Continue if database is initializing
    }

    // 404 Crawl Error Logger for crawler/bot requests to missing legacy paths
    const p = req.path;
    const isCrawlErrorPath = p.includes('.php') || p.startsWith('/wp-') || p.startsWith('/feed') || p.startsWith('/tag/') || p.startsWith('/archives/') || p.includes('.asp');
    if (isCrawlErrorPath) {
      try {
        db.prepare(`
          INSERT INTO seo_crawl_errors (id, path, hits_count, referer, user_agent, ip, status, last_detected)
          VALUES (?, ?, 1, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
          ON CONFLICT(path) DO UPDATE SET hits_count = hits_count + 1, last_detected = CURRENT_TIMESTAMP
        `).run('err-' + Date.now(), p, req.get('referer') || 'Direct Navigation', req.get('user-agent') || 'Search Crawler', req.ip || '127.0.0.1');
      } catch {}
      return res.status(404).send('<!-- 404 Crawl Error Logged in SEO Command Center --> Not Found');
    }
  }
  next();
});

// Dynamic Live XML Sitemap Endpoint
app.get('/sitemap.xml', (req, res) => {
  try {
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const canonical = db.prepare("SELECT value FROM seo_settings WHERE key = 'canonical_domain'").get() as { value: string } | undefined;
    const baseUrl = canonical?.value || `${protocol}://${host}`;

    const articles = db.prepare('SELECT slug, updated_at, created_at FROM articles WHERE published = 1 AND no_index = 0').all() as any[];
    const categories = db.prepare('SELECT slug FROM categories').all() as any[];

    const staticPages = [
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${baseUrl}/travel`, priority: '0.9', changefreq: 'weekly' },
      { loc: `${baseUrl}/lifestyle`, priority: '0.9', changefreq: 'weekly' },
      { loc: `${baseUrl}/health`, priority: '0.9', changefreq: 'weekly' },
      { loc: `${baseUrl}/work-with-us`, priority: '0.8', changefreq: 'monthly' },
      { loc: `${baseUrl}/about`, priority: '0.8', changefreq: 'monthly' }
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    for (const p of staticPages) {
      xml += `  <url>\n    <loc>${p.loc}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
    }

    for (const c of categories) {
      xml += `  <url>\n    <loc>${baseUrl}/category/${c.slug}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
    }

    for (const a of articles) {
      const lastmod = (a.updated_at || a.created_at || new Date().toISOString()).split(' ')[0];
      xml += `  <url>\n    <loc>${baseUrl}/${a.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.90</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err: any) {
    res.status(500).send(`<!-- Error generating sitemap: ${err.message} -->`);
  }
});

// Dynamic Live robots.txt Endpoint
app.get('/robots.txt', (req, res) => {
  try {
    const setting = db.prepare("SELECT value FROM seo_settings WHERE key = 'robots_txt'").get() as { value: string } | undefined;
    const host = req.get('host') || 'localhost:3000';
    const defaultRobots = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: http://${host}/sitemap.xml`;
    res.header('Content-Type', 'text/plain');
    res.send(setting?.value || defaultRobots);
  } catch {
    res.status(500).send('User-agent: *\nDisallow:');
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Toufiq Motion Blog API (Node.js 2026 + SQLite)',
    architecture: 'Modular Monolith with WAL mode'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/settings', settingsRoutes);

// Static frontend serving (from dist directory with long-term immutable caching for hashed chunks)
const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  const assetsDir = path.join(distDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    app.use('/assets', express.static(assetsDir, {
      maxAge: '1y',
      immutable: true
    }));
  }

  app.use(express.static(distDir, {
    maxAge: '1h'
  }));

  // Express 5 compatible SPA fallback
  app.use((req, res, next) => {
    if ((req.method === 'GET' || req.method === 'HEAD') && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(distDir, 'index.html'));
    }
    next();
  });
}

// Error Handler
app.use(errorHandler);
