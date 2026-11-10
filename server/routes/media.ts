import { Router, Request } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { upload } from '../middleware/upload.js';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../db/index.js';
import { optimizeBufferToWebP, optimizeFileToWebP } from '../services/imageOptimizer.js';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

const router = Router();

// GET /api/media (List media library assets with search, filters, pagination, and storage stats)
router.get('/', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 60));
    const offset = (page - 1) * limit;
    const q = (req.query.q as string || '').trim().toLowerCase();
    const filter = (req.query.filter as string || 'all').toLowerCase();
    const sort = (req.query.sort as string || 'newest').toLowerCase();

    let whereClauses: string[] = [];
    let params: any[] = [];

    if (q) {
      whereClauses.push('(LOWER(filename) LIKE ? OR LOWER(original_name) LIKE ? OR LOWER(title) LIKE ? OR LOWER(alt_text) LIKE ?)');
      const term = `%${q}%`;
      params.push(term, term, term, term);
    }

    if (filter === 'webp') {
      whereClauses.push("(mimetype = 'image/webp' OR filename LIKE '%.webp')");
    } else if (filter === 'unoptimized') {
      whereClauses.push('(is_optimized = 0 OR size > 256000)');
    } else if (filter === 'optimized') {
      whereClauses.push('(is_optimized = 1 AND size <= 256000)');
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    let orderBySql = 'ORDER BY created_at DESC';
    if (sort === 'oldest') {
      orderBySql = 'ORDER BY created_at ASC';
    } else if (sort === 'largest') {
      orderBySql = 'ORDER BY size DESC';
    } else if (sort === 'smallest') {
      orderBySql = 'ORDER BY size ASC';
    }

    // Get paginated items
    const items = db.prepare(`
      SELECT * FROM media
      ${whereSql}
      ${orderBySql}
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    // Get total count matching query
    const totalCountRow = db.prepare(`SELECT COUNT(*) as total FROM media ${whereSql}`).get(...params) as { total: number };

    // Get overall storage statistics
    const statsRow = db.prepare(`
      SELECT 
        COUNT(*) as totalItems,
        COALESCE(SUM(size), 0) as totalStorageBytes,
        COALESCE(SUM(CASE WHEN is_optimized = 1 AND size <= 256000 THEN 1 ELSE 0 END), 0) as optimizedCount,
        COALESCE(SUM(CASE WHEN is_optimized = 0 OR size > 256000 THEN 1 ELSE 0 END), 0) as unoptimizedCount
      FROM media
    `).get() as any;

    res.json({
      success: true,
      media: items,
      total: totalCountRow.total,
      page,
      limit,
      stats: {
        totalItems: statsRow.totalItems,
        totalStorageBytes: statsRow.totalStorageBytes,
        optimizedCount: statsRow.optimizedCount,
        unoptimizedCount: statsRow.unoptimizedCount
      }
    });
  } catch (err: any) {
    console.error('Error in GET /api/media:', err);
    res.status(500).json({ error: 'Failed to fetch media library assets' });
  }
});

// POST /api/media/upload (Multi-file or single upload with optional auto-WebP optimization)
router.post('/upload', requireAuth, upload.fields([{ name: 'files', maxCount: 20 }, { name: 'files[]', maxCount: 20 }]), async (req: any, res) => {
  try {
    const filesObj = (req.files || {}) as Record<string, Express.Multer.File[]>;
    const files = [...(filesObj['files'] || []), ...(filesObj['files[]'] || [])];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided for upload' });
    }

    const autoOptimize = req.query.autoOptimize === 'true' || req.body.autoOptimize === 'true';
    const uploadedItems = [];

    const insertStmt = db.prepare(`
      INSERT INTO media (id, filename, original_name, url, mimetype, size, width, height, alt_text, title, is_optimized, original_size, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    for (const file of files) {
      const mediaId = 'med-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
      let finalFilename = file.filename;
      let finalPath = file.path;
      let finalSize = file.size;
      let finalMime = file.mimetype;
      let isOptimized = 0;
      let originalSize = file.size;
      let width = null;
      let height = null;

      try {
        const meta = await sharp(file.path).metadata();
        width = meta.width || null;
        height = meta.height || null;
      } catch {}

      // If autoOptimize is enabled and image is over 250 KB or not WebP
      if (autoOptimize && (file.size > 250 * 1024 || file.mimetype !== 'image/webp')) {
        try {
          const webpFilename = file.filename.replace(/\.[^/.]+$/, '') + '-opt.webp';
          const webpDestPath = path.join(uploadsDir, webpFilename);

          const { result, outputPath } = await optimizeFileToWebP(file.path, webpDestPath, 250 * 1024);
          
          // Delete original raw heavy file
          if (fs.existsSync(file.path) && file.path !== outputPath) {
            try { fs.unlinkSync(file.path); } catch {}
          }

          finalFilename = webpFilename;
          finalPath = outputPath;
          finalSize = result.optimizedSize;
          finalMime = 'image/webp';
          width = result.width;
          height = result.height;
          isOptimized = 1;
        } catch (optErr) {
          console.warn('Auto-optimization skipped for file:', file.originalname, optErr);
        }
      }

      const fileUrl = `/uploads/${finalFilename}`;
      const defaultTitle = file.originalname.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      insertStmt.run(
        mediaId,
        finalFilename,
        file.originalname,
        fileUrl,
        finalMime,
        finalSize,
        width,
        height,
        defaultTitle,
        defaultTitle,
        isOptimized,
        originalSize
      );

      const savedItem = db.prepare('SELECT * FROM media WHERE id = ?').get(mediaId);
      uploadedItems.push(savedItem);
    }

    res.json({
      success: true,
      count: uploadedItems.length,
      media: uploadedItems,
      // For backward compatibility with single image uploaders
      url: uploadedItems[0]?.url,
      filename: uploadedItems[0]?.filename
    });
  } catch (err: any) {
    console.error('Error in POST /api/media/upload:', err);
    res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

// POST /api/media/:id/optimize (Optimize a specific existing library asset to WebP under 250 KB)
router.post('/:id/optimize', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const item = db.prepare('SELECT * FROM media WHERE id = ?').get(id) as any;
    if (!item) {
      return res.status(404).json({ error: 'Media item not found' });
    }

    let inputBuffer: Buffer;
    const isLocalUpload = item.url.startsWith('/uploads/');

    if (isLocalUpload) {
      const filePath = path.join(uploadsDir, item.filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Underlying image file does not exist on disk' });
      }
      inputBuffer = await fs.promises.readFile(filePath);
    } else {
      // External image (e.g. Unsplash sample), fetch buffer
      const response = await fetch(item.url);
      if (!response.ok) {
        return res.status(400).json({ error: 'Could not fetch remote image to optimize' });
      }
      const arrayBuffer = await response.arrayBuffer();
      inputBuffer = Buffer.from(arrayBuffer);
    }

    const originalSize = item.size || inputBuffer.length;
    // Run WebP optimization strictly <= 250 KB
    const result = await optimizeBufferToWebP(inputBuffer, 250 * 1024);

    // Save as local WebP in /uploads
    const baseName = item.filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
    const webpFilename = `${baseName}-${Date.now()}.webp`;
    const webpPath = path.join(uploadsDir, webpFilename);

    await fs.promises.writeFile(webpPath, result.buffer);

    // If there was an old local file with a different name, clean it up
    if (isLocalUpload) {
      const oldFilePath = path.join(uploadsDir, item.filename);
      if (fs.existsSync(oldFilePath) && oldFilePath !== webpPath) {
        try { fs.unlinkSync(oldFilePath); } catch {}
      }
    }

    const newUrl = `/uploads/${webpFilename}`;

    // Update database
    db.prepare(`
      UPDATE media
      SET filename = ?,
          url = ?,
          mimetype = 'image/webp',
          size = ?,
          original_size = ?,
          width = ?,
          height = ?,
          is_optimized = 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(webpFilename, newUrl, result.optimizedSize, originalSize, result.width, result.height, id);

    const updatedItem = db.prepare('SELECT * FROM media WHERE id = ?').get(id);

    res.json({
      success: true,
      message: `Image successfully optimized to WebP (${(result.optimizedSize / 1024).toFixed(1)} KB - under 250 KB limit)`,
      item: updatedItem,
      report: {
        originalSize,
        optimizedSize: result.optimizedSize,
        savingsBytes: result.savingsBytes,
        savingsPercent: result.savingsPercent,
        width: result.width,
        height: result.height,
        format: 'webp',
        qualityUsed: result.qualityUsed
      }
    });
  } catch (err: any) {
    console.error('Error in POST /api/media/:id/optimize:', err);
    res.status(500).json({ error: err.message || 'Image optimization failed' });
  }
});

// POST /api/media/optimize-tool (Standalone Tool: Optimize any image to WebP under 250 KB)
router.post('/optimize-tool', upload.single('image'), async (req: any, res) => {
  try {
    let inputBuffer: Buffer;
    let originalName = 'optimized-image';
    let originalSize = 0;

    if (req.file) {
      inputBuffer = await fs.promises.readFile(req.file.path);
      originalName = req.file.originalname;
      originalSize = req.file.size;
    } else if (req.body.imageUrl) {
      const remoteRes = await fetch(req.body.imageUrl);
      if (!remoteRes.ok) {
        return res.status(400).json({ error: 'Failed to fetch image from provided URL' });
      }
      const arrayBuffer = await remoteRes.arrayBuffer();
      inputBuffer = Buffer.from(arrayBuffer);
      originalSize = inputBuffer.length;
      originalName = path.basename(new URL(req.body.imageUrl).pathname) || 'remote-image';
    } else {
      return res.status(400).json({ error: 'Please upload an image file or provide an imageUrl' });
    }

    // Run WebP optimization strictly <= 250 KB
    const result = await optimizeBufferToWebP(inputBuffer, 250 * 1024);

    // Save optimized file into uploads directory
    const cleanBase = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
    const webpFilename = `${cleanBase}-${Date.now()}.webp`;
    const webpPath = path.join(uploadsDir, webpFilename);

    await fs.promises.writeFile(webpPath, result.buffer);

    // Clean temp multer file if present
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }

    const webpUrl = `/uploads/${webpFilename}`;

    // If user wants to save directly to Media Library
    let savedMediaItem = null;
    if (req.body.saveToLibrary === 'true' || req.query.saveToLibrary === 'true') {
      const mediaId = 'med-' + Date.now();
      const title = originalName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      db.prepare(`
        INSERT INTO media (id, filename, original_name, url, mimetype, size, width, height, alt_text, title, is_optimized, original_size, created_at)
        VALUES (?, ?, ?, ?, 'image/webp', ?, ?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP)
      `).run(mediaId, webpFilename, originalName, webpUrl, result.optimizedSize, result.width, result.height, title, title, originalSize);

      savedMediaItem = db.prepare('SELECT * FROM media WHERE id = ?').get(mediaId);
    }

    // Also provide base64 data preview for immediate browser instant-render
    const base64Data = `data:image/webp;base64,${result.buffer.toString('base64')}`;

    res.json({
      success: true,
      originalName,
      originalSize,
      optimizedSize: result.optimizedSize,
      savingsBytes: result.savingsBytes,
      savingsPercent: result.savingsPercent,
      width: result.width,
      height: result.height,
      format: 'webp',
      url: webpUrl,
      base64Data,
      mediaItem: savedMediaItem,
      qualityUsed: result.qualityUsed
    });
  } catch (err: any) {
    console.error('Error in POST /api/media/optimize-tool:', err);
    res.status(500).json({ error: err.message || 'Image optimization failed' });
  }
});

// POST /api/media/batch-optimize (Batch optimize all heavy/unoptimized assets in the library)
router.post('/batch-optimize', requireAuth, async (req, res) => {
  try {
    const unoptimizedItems = db.prepare(`
      SELECT * FROM media 
      WHERE is_optimized = 0 OR size > 256000
      LIMIT 25
    `).all() as any[];

    let processedCount = 0;
    let totalSavingsBytes = 0;

    for (const item of unoptimizedItems) {
      try {
        let inputBuffer: Buffer | null = null;
        if (item.url.startsWith('/uploads/')) {
          const filePath = path.join(uploadsDir, item.filename);
          if (fs.existsSync(filePath)) {
            inputBuffer = await fs.promises.readFile(filePath);
          }
        } else if (item.url.startsWith('http')) {
          const remote = await fetch(item.url);
          if (remote.ok) {
            const arr = await remote.arrayBuffer();
            inputBuffer = Buffer.from(arr);
          }
        }

        if (inputBuffer) {
          const oldSize = item.size || inputBuffer.length;
          const result = await optimizeBufferToWebP(inputBuffer, 250 * 1024);

          const baseName = item.filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
          const webpFilename = `${baseName}-opt-${Date.now()}.webp`;
          const webpPath = path.join(uploadsDir, webpFilename);

          await fs.promises.writeFile(webpPath, result.buffer);
          const newUrl = `/uploads/${webpFilename}`;

          db.prepare(`
            UPDATE media
            SET filename = ?,
                url = ?,
                mimetype = 'image/webp',
                size = ?,
                original_size = ?,
                width = ?,
                height = ?,
                is_optimized = 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(webpFilename, newUrl, result.optimizedSize, oldSize, result.width, result.height, item.id);

          processedCount++;
          totalSavingsBytes += Math.max(0, oldSize - result.optimizedSize);
        }
      } catch (itemErr) {
        console.warn('Batch optimize skipped item:', item.id, itemErr);
      }
    }

    res.json({
      success: true,
      processedCount,
      totalSavingsBytes,
      message: `Batch optimization completed: ${processedCount} images converted to WebP under 250 KB.`
    });
  } catch (err: any) {
    console.error('Error in POST /api/media/batch-optimize:', err);
    res.status(500).json({ error: 'Batch optimization encountered an error' });
  }
});

// PUT /api/media/:id (Update SEO metadata: Alt text, Title, Caption)
router.put('/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { alt_text, title, caption } = req.body;

    const existing = db.prepare('SELECT id FROM media WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Media asset not found' });
    }

    db.prepare(`
      UPDATE media
      SET alt_text = COALESCE(?, alt_text),
          title = COALESCE(?, title),
          caption = COALESCE(?, caption),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(alt_text, title, caption, id);

    const updated = db.prepare('SELECT * FROM media WHERE id = ?').get(id);
    res.json({ success: true, item: updated });
  } catch (err: any) {
    console.error('Error in PUT /api/media/:id:', err);
    res.status(500).json({ error: 'Failed to update media details' });
  }
});

// DELETE /api/media/:id (Remove file from disk and delete database record)
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const item = db.prepare('SELECT * FROM media WHERE id = ?').get(id) as any;
    if (!item) {
      return res.status(404).json({ error: 'Media asset not found' });
    }

    // Remove from disk if it is a local upload
    if (item.url && item.url.startsWith('/uploads/')) {
      const filePath = path.join(uploadsDir, item.filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch {}
      }
    }

    db.prepare('DELETE FROM media WHERE id = ?').run(id);
    res.json({ success: true, message: 'Media asset deleted successfully' });
  } catch (err: any) {
    console.error('Error in DELETE /api/media/:id:', err);
    res.status(500).json({ error: 'Failed to delete media asset' });
  }
});

export default router;
