import { Router } from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/newsletter (Public: Subscribe)
router.post('/', (req, res) => {
  const { email, name = '', source = 'footer' } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  const existing = db.prepare('SELECT id, status FROM newsletter_subscribers WHERE email = ?').get(email) as any;
  if (existing) {
    if (existing.status === 'unsubscribed') {
      db.prepare('UPDATE newsletter_subscribers SET status = "active" WHERE id = ?').run(existing.id);
      return res.json({ success: true, message: 'Welcome back! Your subscription is active again.' });
    }
    return res.json({ success: true, message: "You're already subscribed to Toufiq Motion updates!" });
  }

  const id = 'sub-' + Date.now();
  db.prepare(`
    INSERT INTO newsletter_subscribers (id, email, name, source)
    VALUES (?, ?, ?, ?)
  `).run(id, email.toLowerCase().trim(), name.trim(), source);

  res.status(201).json({
    success: true,
    message: 'Welcome to the Toufiq Motion community! Check your inbox soon.'
  });
});

// GET /api/newsletter (Admin: View subscribers)
router.get('/', requireAuth, (req, res) => {
  const subscribers = db.prepare('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC').all();
  res.json({ subscribers, total: subscribers.length });
});

// DELETE /api/newsletter/:id (Admin: Delete subscriber)
router.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM newsletter_subscribers WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Subscriber not found' });
  }

  res.json({ success: true, message: 'Subscriber removed' });
});

export default router;

