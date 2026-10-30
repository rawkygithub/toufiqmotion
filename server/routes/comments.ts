import { Router } from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/comments (Admin: view all comments)
router.get('/', requireAuth, (req, res) => {
  const comments = db.prepare(`
    SELECT c.*, a.title as article_title, a.slug as article_slug
    FROM comments c
    JOIN articles a ON c.article_id = a.id
    ORDER BY c.created_at DESC
  `).all();
  res.json({ comments });
});

// POST /api/posts/:articleId/comments (Public: post comment)
router.post('/article/:articleId', (req, res) => {
  const { articleId } = req.params;
  const { authorName, authorEmail, content } = req.body;

  if (!authorName || !content) {
    return res.status(400).json({ error: 'Name and comment message are required' });
  }

  const article = db.prepare('SELECT id FROM articles WHERE id = ?').get(articleId);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }

  const id = 'comm-' + Date.now();
  db.prepare(`
    INSERT INTO comments (id, article_id, author_name, author_email, content, status)
    VALUES (?, ?, ?, ?, ?, 'approved')
  `).run(id, articleId, authorName, authorEmail || null, content);

  const created = db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
  res.status(201).json({ comment: created });
});

// DELETE /api/comments/:id (Admin)
router.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM comments WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  res.json({ success: true, message: 'Comment deleted' });
});

export default router;

