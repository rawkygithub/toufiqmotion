import { Router } from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/inquiries (Public: Submit partnership or contact message)
router.post('/', (req, res) => {
  const { type = 'contact', name, email, company, subject, projectType, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  const id = 'inq-' + Date.now();
  db.prepare(`
    INSERT INTO inquiries (id, type, name, email, company, subject, project_type, message, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')
  `).run(
    id,
    type,
    name.trim(),
    email.toLowerCase().trim(),
    company ? company.trim() : null,
    subject ? subject.trim() : (type === 'partnership' ? projectType : 'General Inquiry'),
    projectType || null,
    message.trim()
  );

  res.status(201).json({
    success: true,
    message: type === 'partnership'
      ? "Thank you for reaching out! We'll review your collaboration inquiry and reply within 24 hours."
      : "Message received! Thank you for getting in touch with Toufiq Motion."
  });
});

// GET /api/inquiries (Admin: View inquiries)
router.get('/', requireAuth, (req, res) => {
  const { type, status } = req.query;

  let query = 'SELECT * FROM inquiries WHERE 1=1';
  const params: any[] = [];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC';

  const inquiries = db.prepare(query).all(...params);
  res.json({ inquiries, total: inquiries.length });
});

// PUT /api/inquiries/:id/status (Admin)
router.put('/:id/status', requireAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['new', 'in_review', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Status must be new, in_review, or resolved' });
  }

  const result = db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(status, id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }

  res.json({ success: true, status });
});

// DELETE /api/inquiries/:id (Admin)
router.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM inquiries WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }

  res.json({ success: true, message: 'Inquiry deleted' });
});

export default router;
