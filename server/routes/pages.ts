import { Router } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/pages (List all pages with stats, search and status filtering)
router.get('/', (req, res) => {
  try {
    const q = (req.query.q as string || '').trim().toLowerCase();
    const status = (req.query.status as string || 'all').toLowerCase();

    let whereClauses: string[] = [];
    let params: any[] = [];

    if (q) {
      whereClauses.push('(LOWER(title) LIKE ? OR LOWER(slug) LIKE ? OR LOWER(excerpt) LIKE ?)');
      const term = `%${q}%`;
      params.push(term, term, term);
    }

    if (status === 'published') {
      whereClauses.push("status = 'published'");
    } else if (status === 'draft') {
      whereClauses.push("status = 'draft'");
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const rows = db.prepare(`
      SELECT * FROM pages
      ${whereSql}
      ORDER BY updated_at DESC
    `).all(...params) as any[];

    const pages = rows.map((row) => ({
      ...row,
      blocks_json: typeof row.blocks_json === 'string' ? JSON.parse(row.blocks_json || '[]') : row.blocks_json,
      no_index: Boolean(row.no_index),
      is_system: Boolean(row.is_system)
    }));

    // Stats overview
    const statsRow = db.prepare(`
      SELECT 
        COUNT(*) as totalPages,
        COALESCE(SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END), 0) as publishedPages,
        COALESCE(SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END), 0) as draftPages,
        COALESCE(SUM(views), 0) as totalViews
      FROM pages
    `).get() as any;

    res.json({
      success: true,
      pages,
      total: pages.length,
      stats: {
        totalPages: statsRow?.totalPages || 0,
        publishedPages: statsRow?.publishedPages || 0,
        draftPages: statsRow?.draftPages || 0,
        totalViews: statsRow?.totalViews || 0
      }
    });
  } catch (err: any) {
    console.error('Error in GET /api/pages:', err);
    res.status(500).json({ error: 'Failed to fetch pages list' });
  }
});

// GET /api/pages/slug/:slug (Public endpoint to view a page by slug)
router.get('/slug/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const cleanSlug = slug.toLowerCase().trim().replace(/^\//, '');

    const page = db.prepare('SELECT * FROM pages WHERE LOWER(slug) = ?').get(cleanSlug) as any;
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Increment view count
    try {
      db.prepare('UPDATE pages SET views = views + 1 WHERE id = ?').run(page.id);
    } catch {}

    res.json({
      success: true,
      page: {
        ...page,
        blocks_json: typeof page.blocks_json === 'string' ? JSON.parse(page.blocks_json || '[]') : page.blocks_json,
        no_index: Boolean(page.no_index),
        is_system: Boolean(page.is_system)
      }
    });
  } catch (err: any) {
    console.error('Error in GET /api/pages/slug/:slug:', err);
    res.status(500).json({ error: 'Failed to load page content' });
  }
});

// GET /api/pages/:id (Fetch single page for editing)
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const page = db.prepare('SELECT * FROM pages WHERE id = ?').get(id) as any;
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({
      success: true,
      page: {
        ...page,
        blocks_json: typeof page.blocks_json === 'string' ? JSON.parse(page.blocks_json || '[]') : page.blocks_json,
        no_index: Boolean(page.no_index),
        is_system: Boolean(page.is_system)
      }
    });
  } catch (err: any) {
    console.error('Error in GET /api/pages/:id:', err);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

// POST /api/pages (Create new page with Page Builder blocks)
router.post('/', requireAuth, (req: AuthRequest, res) => {
  try {
    const {
      title,
      slug,
      excerpt = '',
      status = 'published',
      featured_image = '',
      template = 'custom',
      blocks_json = [],
      meta_title = '',
      meta_description = '',
      focus_keyword = '',
      canonical_url = '',
      no_index = false
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Page title is required' });
    }

    let cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-');

    // Ensure slug uniqueness
    const existingSlug = db.prepare('SELECT id FROM pages WHERE slug = ?').get(cleanSlug);
    if (existingSlug) {
      cleanSlug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
    }

    const id = 'page-' + Date.now();
    const blocksString = typeof blocks_json === 'string' ? blocks_json : JSON.stringify(blocks_json);

    // Calculate SEO score based on title, meta, content
    let seoScore = 80;
    if (meta_title && meta_title.length >= 30) seoScore += 5;
    if (meta_description && meta_description.length >= 80) seoScore += 5;
    if (focus_keyword) seoScore += 5;
    if (blocks_json.length >= 3) seoScore += 4;

    db.prepare(`
      INSERT INTO pages (
        id, title, slug, excerpt, status, featured_image, template, blocks_json,
        meta_title, meta_description, focus_keyword, canonical_url, no_index, seo_score, is_system, views, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      id,
      title.trim(),
      cleanSlug,
      excerpt.trim(),
      status,
      featured_image,
      template,
      blocksString,
      meta_title || title.trim(),
      meta_description || excerpt.trim(),
      focus_keyword.trim(),
      canonical_url.trim(),
      no_index ? 1 : 0,
      Math.min(100, seoScore)
    );

    const createdPage = db.prepare('SELECT * FROM pages WHERE id = ?').get(id) as any;
    res.status(201).json({
      success: true,
      message: 'Page created successfully',
      page: {
        ...createdPage,
        blocks_json: JSON.parse(createdPage.blocks_json || '[]'),
        no_index: Boolean(createdPage.no_index)
      }
    });
  } catch (err: any) {
    console.error('Error in POST /api/pages:', err);
    res.status(500).json({ error: err.message || 'Failed to create page' });
  }
});

// PUT /api/pages/:id (Update page and page builder blocks)
router.put('/:id', requireAuth, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM pages WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const {
      title,
      slug,
      excerpt,
      status,
      featured_image,
      template,
      blocks_json,
      meta_title,
      meta_description,
      focus_keyword,
      canonical_url,
      no_index
    } = req.body;

    let finalSlug = existing.slug;
    if (slug && slug !== existing.slug) {
      finalSlug = slug
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-');

      // Check collision
      const collision = db.prepare('SELECT id FROM pages WHERE slug = ? AND id != ?').get(finalSlug, id);
      if (collision) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const blocksString = blocks_json !== undefined
      ? (typeof blocks_json === 'string' ? blocks_json : JSON.stringify(blocks_json))
      : existing.blocks_json;

    // Recalculate SEO score
    let seoScore = 80;
    const checkTitle = title || existing.title;
    const checkMetaTitle = meta_title || existing.meta_title;
    const checkMetaDesc = meta_description || existing.meta_description;
    const checkKeyword = focus_keyword || existing.focus_keyword;
    if (checkMetaTitle && checkMetaTitle.length >= 30) seoScore += 5;
    if (checkMetaDesc && checkMetaDesc.length >= 80) seoScore += 5;
    if (checkKeyword) seoScore += 5;

    db.prepare(`
      UPDATE pages
      SET title = COALESCE(?, title),
          slug = ?,
          excerpt = COALESCE(?, excerpt),
          status = COALESCE(?, status),
          featured_image = COALESCE(?, featured_image),
          template = COALESCE(?, template),
          blocks_json = ?,
          meta_title = COALESCE(?, meta_title),
          meta_description = COALESCE(?, meta_description),
          focus_keyword = COALESCE(?, focus_keyword),
          canonical_url = COALESCE(?, canonical_url),
          no_index = COALESCE(?, no_index),
          seo_score = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title ? title.trim() : null,
      finalSlug,
      excerpt !== undefined ? excerpt.trim() : null,
      status || null,
      featured_image !== undefined ? featured_image : null,
      template || null,
      blocksString,
      meta_title !== undefined ? meta_title.trim() : null,
      meta_description !== undefined ? meta_description.trim() : null,
      focus_keyword !== undefined ? focus_keyword.trim() : null,
      canonical_url !== undefined ? canonical_url.trim() : null,
      no_index !== undefined ? (no_index ? 1 : 0) : null,
      Math.min(100, seoScore),
      id
    );

    const updated = db.prepare('SELECT * FROM pages WHERE id = ?').get(id) as any;
    res.json({
      success: true,
      message: 'Page updated successfully',
      page: {
        ...updated,
        blocks_json: JSON.parse(updated.blocks_json || '[]'),
        no_index: Boolean(updated.no_index)
      }
    });
  } catch (err: any) {
    console.error('Error in PUT /api/pages/:id:', err);
    res.status(500).json({ error: err.message || 'Failed to update page' });
  }
});

// POST /api/pages/:id/duplicate (Duplicate page and blocks)
router.post('/:id/duplicate', requireAuth, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const page = db.prepare('SELECT * FROM pages WHERE id = ?').get(id) as any;
    if (!page) {
      return res.status(404).json({ error: 'Page not found to duplicate' });
    }

    const newId = 'page-' + Date.now();
    const newTitle = `${page.title} (Copy)`;
    const newSlug = `${page.slug}-copy-${Date.now().toString().slice(-4)}`;

    db.prepare(`
      INSERT INTO pages (
        id, title, slug, excerpt, status, featured_image, template, blocks_json,
        meta_title, meta_description, focus_keyword, canonical_url, no_index, seo_score, is_system, views, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      newId,
      newTitle,
      newSlug,
      page.excerpt,
      page.featured_image,
      page.template,
      page.blocks_json,
      newTitle,
      page.meta_description,
      page.focus_keyword,
      '',
      page.no_index,
      page.seo_score
    );

    const duplicated = db.prepare('SELECT * FROM pages WHERE id = ?').get(newId) as any;
    res.json({
      success: true,
      message: 'Page duplicated as draft',
      page: {
        ...duplicated,
        blocks_json: JSON.parse(duplicated.blocks_json || '[]')
      }
    });
  } catch (err: any) {
    console.error('Error in POST /api/pages/:id/duplicate:', err);
    res.status(500).json({ error: 'Failed to duplicate page' });
  }
});

// POST /api/pages/:id/add-to-menu (1-click add custom page to navigation bar)
router.post('/:id/add-to-menu', requireAuth, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const page = db.prepare('SELECT * FROM pages WHERE id = ?').get(id) as any;
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Read site_settings
    const settingRow = db.prepare("SELECT value FROM site_settings WHERE key = 'menu_items_json'").get() as any;
    let menuItems = [];
    if (settingRow && settingRow.value) {
      try { menuItems = JSON.parse(settingRow.value); } catch {}
    }

    // Check if item already exists in menu
    const alreadyExists = menuItems.some((m: any) => m.url === `/${page.slug}` || m.pageId === page.slug);
    if (alreadyExists) {
      return res.json({ success: true, message: 'Page is already present in the navigation menu' });
    }

    const newMenuItem = {
      id: 'm-' + page.slug,
      label: page.title,
      type: 'page',
      pageId: page.slug,
      url: `/${page.slug}`,
      hasDropdown: false,
      enabled: true
    };

    menuItems.push(newMenuItem);

    db.prepare(`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('menu_items_json', ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(JSON.stringify(menuItems));

    res.json({
      success: true,
      message: `"${page.title}" added to navigation menu successfully!`,
      menuItems
    });
  } catch (err: any) {
    console.error('Error in POST /api/pages/:id/add-to-menu:', err);
    res.status(500).json({ error: 'Failed to add page to navigation menu' });
  }
});

// DELETE /api/pages/:id (Delete page with system protection)
router.delete('/:id', requireAuth, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const page = db.prepare('SELECT is_system, title FROM pages WHERE id = ?').get(id) as any;
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    if (page.is_system) {
      return res.status(403).json({ error: 'System core pages cannot be deleted' });
    }

    db.prepare('DELETE FROM pages WHERE id = ?').run(id);
    res.json({ success: true, message: `Page "${page.title}" deleted successfully` });
  } catch (err: any) {
    console.error('Error in DELETE /api/pages/:id:', err);
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

export default router;

