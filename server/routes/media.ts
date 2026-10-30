import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/media/upload (Admin: Upload an image)
router.post('/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

export default router;

