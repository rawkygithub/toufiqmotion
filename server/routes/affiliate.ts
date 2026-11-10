import { Router } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/affiliate/overview (Performance metrics, click totals, top merchants & products)
router.get('/overview', (req, res) => {
  try {
    const statsRow = db.prepare(`
      SELECT 
        COUNT(*) as totalLinks,
        COALESCE(SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END), 0) as activeLinks,
        COALESCE(SUM(clicks_count), 0) as totalClicks
      FROM affiliate_links
    `).get() as any;

    const todayClicksRow = db.prepare(`
      SELECT COUNT(*) as count 
      FROM affiliate_clicks 
      WHERE datetime(created_at) >= datetime('now', '-1 day')
    `).get() as any;

    const merchants = db.prepare(`
      SELECT 
        merchant, 
        COUNT(*) as linksCount,
        COALESCE(SUM(clicks_count), 0) as clicks
      FROM affiliate_links
      GROUP BY merchant
      ORDER BY clicks DESC
    `).all() as any[];

    const topProducts = db.prepare(`
      SELECT id, title, slug, merchant, category, price, rating, badge, image_url, clicks_count, last_clicked_at
      FROM affiliate_links
      WHERE is_active = 1
      ORDER BY clicks_count DESC
      LIMIT 6
    `).all() as any[];

    const recentClicks = db.prepare(`
      SELECT c.*, l.title as product_title
      FROM affiliate_clicks c
      LEFT JOIN affiliate_links l ON c.link_id = l.id
      ORDER BY c.created_at DESC
      LIMIT 15
    `).all() as any[];

    res.json({
      success: true,
      metrics: {
        totalLinks: statsRow?.totalLinks || 0,
        activeLinks: statsRow?.activeLinks || 0,
        totalClicks: statsRow?.totalClicks || 0,
        clicksToday: todayClicksRow?.count || 0
      },
      merchants,
      topProducts,
      recentClicks
    });
  } catch (err: any) {
    console.error('Error fetching affiliate overview:', err);
    res.status(500).json({ error: 'Failed to fetch affiliate overview' });
  }
});

// GET /api/affiliate/links (List all affiliate links with search, merchant and category filters)
router.get('/links', (req, res) => {
  try {
    const q = (req.query.q as string || '').trim().toLowerCase();
    const merchant = (req.query.merchant as string || 'all').trim();
    const category = (req.query.category as string || 'all').trim();

    let whereClauses: string[] = [];
    let params: any[] = [];

    if (q) {
      whereClauses.push('(LOWER(title) LIKE ? OR LOWER(slug) LIKE ? OR LOWER(description) LIKE ?)');
      const term = `%${q}%`;
      params.push(term, term, term);
    }

    if (merchant && merchant !== 'all') {
      whereClauses.push('LOWER(merchant) = ?');
      params.push(merchant.toLowerCase());
    }

    if (category && category !== 'all') {
      whereClauses.push('LOWER(category) = ?');
      params.push(category.toLowerCase());
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const rows = db.prepare(`
      SELECT * FROM affiliate_links
      ${whereSql}
      ORDER BY clicks_count DESC, updated_at DESC
    `).all(...params) as any[];

    const links = rows.map((r) => ({
      ...r,
      pros: typeof r.pros_json === 'string' ? JSON.parse(r.pros_json || '[]') : r.pros_json,
      cons: typeof r.cons_json === 'string' ? JSON.parse(r.cons_json || '[]') : r.cons_json,
      is_active: Boolean(r.is_active)
    }));

    res.json({
      success: true,
      links,
      total: links.length
    });
  } catch (err: any) {
    console.error('Error fetching affiliate links:', err);
    res.status(500).json({ error: 'Failed to fetch affiliate links' });
  }
});

// GET /api/affiliate/links/:id
router.get('/links/:id', (req, res) => {
  try {
    const link = db.prepare('SELECT * FROM affiliate_links WHERE id = ?').get(req.params.id) as any;
    if (!link) {
      return res.status(404).json({ error: 'Affiliate link not found' });
    }

    res.json({
      success: true,
      link: {
        ...link,
        pros: typeof link.pros_json === 'string' ? JSON.parse(link.pros_json || '[]') : link.pros_json,
        cons: typeof link.cons_json === 'string' ? JSON.parse(link.cons_json || '[]') : link.cons_json,
        is_active: Boolean(link.is_active)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch affiliate link' });
  }
});

// POST /api/affiliate/links (Create cloaked link)
router.post('/links', requireAuth, (req: AuthRequest, res) => {
  try {
    const {
      title,
      slug,
      target_url,
      merchant = 'Amazon',
      category = 'Gear',
      price = '',
      rating = 4.9,
      badge = "Editor's Choice",
      image_url = '',
      description = '',
      pros = [],
      cons = [],
      button_text = 'Check Price on Amazon',
      secondary_url = '',
      secondary_button_text = '',
      is_active = true
    } = req.body;

    if (!title || !target_url) {
      return res.status(400).json({ error: 'Title and target affiliate URL are required' });
    }

    let cleanSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check slug collision
    const existing = db.prepare('SELECT id FROM affiliate_links WHERE slug = ?').get(cleanSlug);
    if (existing) {
      cleanSlug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
    }

    const id = 'aff-' + Date.now();

    db.prepare(`
      INSERT INTO affiliate_links (
        id, title, slug, target_url, merchant, category, price, rating, badge,
        image_url, description, pros_json, cons_json, button_text, secondary_url,
        secondary_button_text, is_active, rel_tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      id,
      title.trim(),
      cleanSlug,
      target_url.trim(),
      merchant.trim(),
      category.trim(),
      price.trim(),
      Number(rating) || 4.9,
      badge.trim(),
      image_url.trim(),
      description.trim(),
      JSON.stringify(pros),
      JSON.stringify(cons),
      button_text.trim(),
      (secondary_url || '').trim(),
      (secondary_button_text || '').trim(),
      is_active ? 1 : 0,
      'nofollow sponsored noopener'
    );

    const created = db.prepare('SELECT * FROM affiliate_links WHERE id = ?').get(id) as any;

    res.status(201).json({
      success: true,
      message: 'Affiliate link created successfully',
      link: {
        ...created,
        pros,
        cons,
        is_active: Boolean(created.is_active)
      }
    });
  } catch (err: any) {
    console.error('Error creating affiliate link:', err);
    res.status(500).json({ error: err.message || 'Failed to create affiliate link' });
  }
});

// PUT /api/affiliate/links/:id (Update cloaked link)
router.put('/links/:id', requireAuth, (req: AuthRequest, res) => {
  try {
    const existing = db.prepare('SELECT * FROM affiliate_links WHERE id = ?').get(req.params.id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Affiliate link not found' });
    }

    const {
      title = existing.title,
      slug = existing.slug,
      target_url = existing.target_url,
      merchant = existing.merchant,
      category = existing.category,
      price = existing.price,
      rating = existing.rating,
      badge = existing.badge,
      image_url = existing.image_url,
      description = existing.description,
      pros,
      cons,
      button_text = existing.button_text,
      secondary_url = existing.secondary_url,
      secondary_button_text = existing.secondary_button_text,
      is_active
    } = req.body;

    const prosJson = pros !== undefined ? JSON.stringify(pros) : existing.pros_json;
    const consJson = cons !== undefined ? JSON.stringify(cons) : existing.cons_json;
    const activeVal = is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active;

    db.prepare(`
      UPDATE affiliate_links SET
        title = ?,
        slug = ?,
        target_url = ?,
        merchant = ?,
        category = ?,
        price = ?,
        rating = ?,
        badge = ?,
        image_url = ?,
        description = ?,
        pros_json = ?,
        cons_json = ?,
        button_text = ?,
        secondary_url = ?,
        secondary_button_text = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title.trim(),
      slug.trim().toLowerCase(),
      target_url.trim(),
      merchant.trim(),
      category.trim(),
      price.trim(),
      Number(rating) || 4.9,
      badge.trim(),
      image_url.trim(),
      description.trim(),
      prosJson,
      consJson,
      button_text.trim(),
      (secondary_url || '').trim(),
      (secondary_button_text || '').trim(),
      activeVal,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM affiliate_links WHERE id = ?').get(req.params.id) as any;

    res.json({
      success: true,
      message: 'Affiliate link updated successfully',
      link: {
        ...updated,
        pros: JSON.parse(updated.pros_json || '[]'),
        cons: JSON.parse(updated.cons_json || '[]'),
        is_active: Boolean(updated.is_active)
      }
    });
  } catch (err: any) {
    console.error('Error updating affiliate link:', err);
    res.status(500).json({ error: err.message || 'Failed to update affiliate link' });
  }
});

// DELETE /api/affiliate/links/:id
router.delete('/links/:id', requireAuth, (req: AuthRequest, res) => {
  try {
    const link = db.prepare('SELECT id FROM affiliate_links WHERE id = ?').get(req.params.id);
    if (!link) {
      return res.status(404).json({ error: 'Affiliate link not found' });
    }

    db.prepare('DELETE FROM affiliate_clicks WHERE link_id = ?').run(req.params.id);
    db.prepare('DELETE FROM affiliate_links WHERE id = ?').run(req.params.id);

    res.json({ success: true, message: 'Affiliate link deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete affiliate link' });
  }
});

// GET /api/affiliate/clicks (Click stream log)
router.get('/clicks', requireAuth, (req: AuthRequest, res) => {
  try {
    const clicks = db.prepare(`
      SELECT c.*, l.title as product_title, l.merchant
      FROM affiliate_clicks c
      LEFT JOIN affiliate_links l ON c.link_id = l.id
      ORDER BY c.created_at DESC
      LIMIT 50
    `).all() as any[];

    res.json({ success: true, clicks, total: clicks.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch clicks' });
  }
});

// POST /api/affiliate/generate-box-html (High-converting Product Review Card Generator)
router.post('/generate-box-html', (req, res) => {
  try {
    const {
      title = 'Featured Product',
      slug = 'product',
      badge = "Editor's Choice",
      rating = 4.9,
      price = '',
      merchant = 'Amazon',
      imageUrl = '',
      description = '',
      pros = [],
      cons = [],
      buttonText = 'Check Price',
      secondaryUrl = '',
      secondaryButtonText = ''
    } = req.body;

    const cloakedUrl = `/go/${slug}`;
    const prosHtml = (pros || [])
      .map((p: string) => `<li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;font-size:13px;color:#2D2A26;"><span style="color:#10B981;font-weight:bold;line-height:1;">✓</span> <span>${p}</span></li>`)
      .join('');
    const consHtml = (cons || [])
      .map((c: string) => `<li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;font-size:13px;color:#2D2A26;"><span style="color:#EF4444;font-weight:bold;line-height:1;">✕</span> <span>${c}</span></li>`)
      .join('');

    const html = `
<div class="affiliate-product-card" style="margin:36px 0;border-radius:24px;border:1px solid #EDE7DF;background:#FFFFFF;box-shadow:0 4px 20px -2px rgba(0,0,0,0.05);overflow:hidden;font-family:system-ui,-apple-system,sans-serif;">
  <div style="background:#FAF8F5;border-bottom:1px solid #F0ECE6;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
    ${badge ? `<span style="display:inline-flex;align-items:center;gap:6px;background:#FFF2EB;color:#E8734A;border:1px solid #FFCEBA;padding:4px 12px;border-radius:9999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">★ ${badge}</span>` : ''}
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="font-size:13px;font-weight:700;color:#1E1B18;">${rating} / 5.0</span>
      <span style="color:#F59E0B;letter-spacing:1px;font-size:14px;">★★★★★</span>
    </div>
  </div>

  <div style="padding:24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;align-items:center;">
    ${imageUrl ? `
    <div style="text-align:center;">
      <img src="${imageUrl}" alt="${title}" style="max-height:220px;max-width:100%;object-fit:contain;border-radius:16px;margin:0 auto;display:block;" />
      ${price ? `<div style="margin-top:12px;font-family:serif;font-size:20px;font-weight:700;color:#1E1B18;">${price} <span style="font-size:11px;color:#8C8477;font-family:sans-serif;font-weight:normal;">(${merchant})</span></div>` : ''}
    </div>` : ''}

    <div>
      <h3 style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#1E1B18;margin:0 0 10px 0;line-height:1.25;">${title}</h3>
      ${description ? `<p style="font-size:14px;color:#5A5348;line-height:1.6;margin:0 0 16px 0;">${description}</p>` : ''}

      ${(pros.length > 0 || cons.length > 0) ? `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:20px;padding:14px;background:#FAF8F5;border-radius:16px;border:1px solid #EDE7DF;">
        ${pros.length > 0 ? `
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#10B981;margin-bottom:8px;">Key Advantages</div>
          <ul style="list-style:none;padding:0;margin:0;">${prosHtml}</ul>
        </div>` : ''}
        ${cons.length > 0 ? `
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#EF4444;margin-bottom:8px;">Considerations</div>
          <ul style="list-style:none;padding:0;margin:0;">${consHtml}</ul>
        </div>` : ''}
      </div>` : ''}

      <div style="display:flex;align-items:center;flex-wrap:wrap;gap:12px;padding-top:4px;">
        <a href="${cloakedUrl}" target="_blank" rel="nofollow sponsored noopener" style="display:inline-flex;align-items:center;gap:8px;background:#E8734A;color:#FFFFFF;padding:12px 24px;border-radius:14px;font-size:13px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.04em;box-shadow:0 2px 8px rgba(232,115,74,0.3);transition:all 0.2s ease;">
          <span>${buttonText || 'Check Price on ' + merchant}</span>
          <span>&rarr;</span>
        </a>
        ${secondaryUrl ? `
        <a href="${secondaryUrl}" target="_blank" rel="nofollow sponsored noopener" style="display:inline-flex;align-items:center;gap:6px;background:#FAF8F5;color:#2D2A26;border:1px solid #E0DCD4;padding:12px 20px;border-radius:14px;font-size:13px;font-weight:600;text-decoration:none;">
          <span>${secondaryButtonText || 'Official Website'}</span>
        </a>` : ''}
      </div>
    </div>
  </div>
</div>
`.trim();

    res.json({ success: true, html });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate box HTML' });
  }
});

// GET /api/affiliate/settings (FTC Disclosure settings)
router.get('/settings', (req, res) => {
  try {
    const disclosure = db.prepare("SELECT value FROM site_settings WHERE key = 'affiliate_ftc_disclosure'").get() as any;
    const position = db.prepare("SELECT value FROM site_settings WHERE key = 'affiliate_disclosure_position'").get() as any;
    const autoNofollow = db.prepare("SELECT value FROM site_settings WHERE key = 'affiliate_auto_nofollow'").get() as any;

    res.json({
      success: true,
      settings: {
        disclosure: disclosure?.value || 'Affiliate Disclosure: Toufiq Motion is reader-supported. When you purchase through links on our site, we may earn an affiliate commission at no extra cost to you.',
        position: position?.value || 'top',
        autoNofollow: autoNofollow?.value === 'true'
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// POST /api/affiliate/settings
router.post('/settings', requireAuth, (req: AuthRequest, res) => {
  try {
    const { disclosure, position = 'top', autoNofollow = true } = req.body;

    const upsert = db.prepare(`
      INSERT INTO site_settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);

    if (disclosure !== undefined) upsert.run('affiliate_ftc_disclosure', disclosure);
    if (position !== undefined) upsert.run('affiliate_disclosure_position', position);
    if (autoNofollow !== undefined) upsert.run('affiliate_auto_nofollow', String(autoNofollow));

    res.json({ success: true, message: 'Affiliate & FTC settings updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

export default router;

