import { Router } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');
}

// GET /api/categories (Public: list categories with article count)
router.get('/', (req, res) => {
  const categories = db.prepare(`
    SELECT c.*, COUNT(a.id) as article_count
    FROM categories c
    LEFT JOIN articles a ON a.category = c.name AND a.published = 1
    GROUP BY c.id
    ORDER BY c.created_at ASC
  `).all();

  const formatted = categories.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    icon: cat.icon || 'Compass',
    image: cat.image,
    subcategories: JSON.parse(cat.subcategories_json || '[]'),
    articleCount: cat.article_count,
    createdAt: cat.created_at
  }));

  res.json({ categories: formatted, total: formatted.length });
});

// POST /api/categories (Admin: create category)
router.post('/', requireAuth, (req: AuthRequest, res) => {
  const { name, description, icon = 'Compass', image, subcategories = [] } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const trimmedName = name.trim();
  const slug = slugify(trimmedName);

  // Check if exists
  const existing = db.prepare('SELECT id FROM categories WHERE name = ? OR slug = ?').get(trimmedName, slug);
  if (existing) {
    return res.status(400).json({ error: 'A category with this name already exists' });
  }

  const id = 'cat-' + Date.now();
  const subcatsArray = Array.isArray(subcategories)
    ? subcategories
    : subcategories.split(',').map((s: string) => s.trim()).filter(Boolean);

  db.prepare(`
    INSERT INTO categories (id, name, slug, description, icon, image, subcategories_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    trimmedName,
    slug,
    description ? description.trim() : null,
    icon,
    image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    JSON.stringify(subcatsArray)
  );

  const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any;
  res.status(201).json({
    category: {
      ...created,
      subcategories: JSON.parse(created.subcategories_json || '[]'),
      articleCount: 0
    }
  });
});

// PUT /api/categories/:id (Admin: update category)
router.put('/:id', requireAuth, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { name, description, icon, image, subcategories } = req.body;

  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any;
  if (!existing) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const newName = name ? name.trim() : existing.name;
  const newSlug = name ? slugify(newName) : existing.slug;
  const subcatsJson = subcategories !== undefined
    ? JSON.stringify(Array.isArray(subcategories) ? subcategories : subcategories.split(',').map((s: string) => s.trim()))
    : existing.subcategories_json;

  // Update articles category name if category name changed
  if (newName !== existing.name) {
    db.prepare('UPDATE articles SET category = ? WHERE category = ?').run(newName, existing.name);
  }

  db.prepare(`
    UPDATE categories SET
      name = ?,
      slug = ?,
      description = COALESCE(?, description),
      icon = COALESCE(?, icon),
      image = COALESCE(?, image),
      subcategories_json = ?
    WHERE id = ?
  `).run(
    newName,
    newSlug,
    description,
    icon,
    image,
    subcatsJson,
    id
  );

  const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any;
  res.json({
    category: {
      ...updated,
      subcategories: JSON.parse(updated.subcategories_json || '[]')
    }
  });
});

// DELETE /api/categories/:id (Admin: delete category)
router.delete('/:id', requireAuth, (req: AuthRequest, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any;
  if (!existing) {
    return res.status(404).json({ error: 'Category not found' });
  }

  // Count articles in this category
  const linked = db.prepare('SELECT COUNT(*) as count FROM articles WHERE category = ?').get(existing.name) as { count: number };
  if (linked.count > 0) {
    return res.status(400).json({
      error: `Cannot delete category "${existing.name}" because it contains ${linked.count} articles. Please reassign or delete those articles first.`
    });
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.json({ success: true, message: `Category "${existing.name}" deleted successfully` });
});

export default router;

