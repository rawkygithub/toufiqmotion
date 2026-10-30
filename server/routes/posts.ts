import { Router } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

function formatArticle(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    subcategory: row.subcategory,
    date: row.date,
    readTime: row.read_time,
    image: row.image,
    featured: Boolean(row.featured),
    trendingRank: row.trending_rank,
    author: {
      name: row.author_name,
      avatar: row.author_avatar,
      role: row.author_role
    },
    quote: row.quote,
    tags: JSON.parse(row.tags_json || '[]'),
    content: JSON.parse(row.content_json || '[]'),
    viewsCount: row.views_count,
    likesCount: row.likes_count,
    published: Boolean(row.published),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');
}

// GET /api/posts
router.get('/', (req, res) => {
  const { category, subcategory, tag, q, featured, sort, limit = 50, page = 1 } = req.query;

  let query = 'SELECT * FROM articles WHERE published = 1';
  const params: any[] = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (subcategory) {
    query += ' AND subcategory = ?';
    params.push(subcategory);
  }

  if (featured === '1' || featured === 'true') {
    query += ' AND featured = 1';
  }

  if (q) {
    query += ' AND (title LIKE ? OR excerpt LIKE ? OR tags_json LIKE ?)';
    const search = `%${q}%`;
    params.push(search, search, search);
  }

  if (tag) {
    query += ' AND tags_json LIKE ?';
    params.push(`%"${tag}"%`);
  }

  // Sorting
  if (sort === 'popular') {
    query += ' ORDER BY views_count DESC';
  } else if (sort === 'trending') {
    query += ' ORDER BY trending_rank ASC NULLS LAST, likes_count DESC';
  } else {
    query += ' ORDER BY created_at DESC';
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit as string) || 50));
  const offset = (pageNum - 1) * limitNum;

  query += ' LIMIT ? OFFSET ?';
  params.push(limitNum, offset);

  const rows = db.prepare(query).all(...params);
  const articles = rows.map(formatArticle);

  // Total count
  const countQuery = 'SELECT COUNT(*) as total FROM articles WHERE published = 1';
  const { total } = db.prepare(countQuery).get() as { total: number };

  res.json({
    articles,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  });
});

// GET /api/posts/:slugOrId
router.get('/:slugOrId', (req, res) => {
  const { slugOrId } = req.params;

  let row = db.prepare('SELECT * FROM articles WHERE slug = ?').get(slugOrId);
  if (!row) {
    row = db.prepare('SELECT * FROM articles WHERE id = ?').get(slugOrId);
  }

  if (!row) {
    return res.status(404).json({ error: 'Article not found' });
  }

  // Automatically increment view count
  db.prepare('UPDATE articles SET views_count = views_count + 1 WHERE id = ?').run((row as any).id);

  // Fetch comments for this article
  const comments = db.prepare("SELECT * FROM comments WHERE article_id = ? AND status = 'approved' ORDER BY created_at DESC").all((row as any).id);

  res.json({
    article: {
      ...formatArticle(row),
      viewsCount: (row as any).views_count + 1
    },
    comments
  });
});

// POST /api/posts/:id/like
router.post('/:id/like', (req, res) => {
  const { id } = req.params;
  const result = db.prepare('UPDATE articles SET likes_count = likes_count + 1 WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Article not found' });
  }

  const row = db.prepare('SELECT likes_count FROM articles WHERE id = ?').get(id) as { likes_count: number };
  res.json({ likesCount: row.likes_count });
});

// POST /api/posts (Admin Protected)
router.post('/', requireAuth, (req: AuthRequest, res) => {
  const {
    title,
    excerpt,
    category,
    subcategory,
    image,
    content,
    tags = [],
    quote,
    featured = false
  } = req.body;

  if (!title || !category || !subcategory || !image) {
    return res.status(400).json({ error: 'Title, category, subcategory, and image are required' });
  }

  const id = 'post-' + Date.now();
  let slug = slugify(title);

  // Check if slug exists
  const existing = db.prepare('SELECT id FROM articles WHERE slug = ?').get(slug);
  if (existing) {
    slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
  }

  const contentArray = Array.isArray(content) ? content : [content || excerpt];
  const totalWords = contentArray.join(' ').split(/\s+/).length;
  const readTime = `${Math.max(3, Math.ceil(totalWords / 150))} min read`;

  const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());

  const stmt = db.prepare(`
    INSERT INTO articles (
      id, slug, title, excerpt, category, subcategory, date, read_time,
      image, featured, author_name, author_avatar, author_role,
      quote, tags_json, content_json, views_count, likes_count, published
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 1)
  `);

  stmt.run(
    id,
    slug,
    title,
    excerpt || title,
    category,
    subcategory,
    date,
    readTime,
    image,
    featured ? 1 : 0,
    req.user?.email === 'admin@toufiqmotion.com' ? 'Toufiq Motion' : 'Editorial Team',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'Founder & Travel Photographer',
    quote || null,
    JSON.stringify(tags),
    JSON.stringify(contentArray)
  );

  const created = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
  res.status(201).json({ article: formatArticle(created) });
});

// PUT /api/posts/:id (Admin Protected)
router.put('/:id', requireAuth, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { title, excerpt, category, subcategory, image, content, tags, quote, featured } = req.body;

  const existing = db.prepare('SELECT * FROM articles WHERE id = ?').get(id) as any;
  if (!existing) {
    return res.status(404).json({ error: 'Article not found' });
  }

  const updatedTags = tags ? JSON.stringify(tags) : existing.tags_json;
  const updatedContent = content ? JSON.stringify(Array.isArray(content) ? content : [content]) : existing.content_json;

  db.prepare(`
    UPDATE articles SET
      title = COALESCE(?, title),
      excerpt = COALESCE(?, excerpt),
      category = COALESCE(?, category),
      subcategory = COALESCE(?, subcategory),
      image = COALESCE(?, image),
      quote = COALESCE(?, quote),
      featured = COALESCE(?, featured),
      tags_json = ?,
      content_json = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title,
    excerpt,
    category,
    subcategory,
    image,
    quote,
    featured !== undefined ? (featured ? 1 : 0) : existing.featured,
    updatedTags,
    updatedContent,
    id
  );

  const updated = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
  res.json({ article: formatArticle(updated) });
});

// DELETE /api/posts/:id (Admin Protected)
router.delete('/:id', requireAuth, (req: AuthRequest, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM articles WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Article not found' });
  }

  res.json({ success: true, message: 'Article deleted successfully' });
});

export default router;
