import { Router } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/settings
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM site_settings').all() as { key: string; value: string }[];
    const settings: Record<string, any> = {};

    for (const r of rows) {
      try {
        // Try parsing JSON if applicable (e.g. menu_items_json, footer_values_json)
        if (r.key.endsWith('_json')) {
          settings[r.key] = JSON.parse(r.value);
        } else if (r.value === 'true') {
          settings[r.key] = true;
        } else if (r.value === 'false') {
          settings[r.key] = false;
        } else {
          settings[r.key] = r.value;
        }
      } catch {
        settings[r.key] = r.value;
      }
    }

    res.json({ settings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings (Admin Protected)
router.post('/', requireAuth, (req: AuthRequest, res) => {
  const updates = req.body;

  try {
    const upsert = db.prepare(`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);

    for (const [k, v] of Object.entries(updates)) {
      if (typeof v === 'boolean') {
        upsert.run(k, v ? 'true' : 'false');
      } else if (typeof v === 'object' && v !== null) {
        upsert.run(k, JSON.stringify(v));
      } else if (v !== undefined) {
        upsert.run(k, String(v));
      }
    }

    res.json({ success: true, message: 'Site appearance & customizer settings updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

