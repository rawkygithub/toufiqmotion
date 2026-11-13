import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();
const ALLOWED_ROLES = ['admin', 'editor', 'author', 'contributor'];

// 1. GET /api/users - List all users
router.get('/', requireAuth, (req: AuthRequest, res) => {
  try {
    const rows = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, u.avatar, u.created_at,
             (SELECT COUNT(*) FROM articles a WHERE a.author_name = u.name) as articlesCount
      FROM users u
      ORDER BY (u.role = 'admin') DESC, u.created_at ASC
    `).all() as any[];

    const users = rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role || 'admin',
      avatar: r.avatar || null,
      created_at: r.created_at,
      articlesCount: Number(r.articlesCount || 0)
    }));

    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve users' });
  }
});

// 2. GET /api/users/:id - Get single user
router.get('/:id', requireAuth, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const r = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, u.avatar, u.created_at,
             (SELECT COUNT(*) FROM articles a WHERE a.author_name = u.name) as articlesCount
      FROM users u
      WHERE u.id = ?
    `).get(id) as any;

    if (!r) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role || 'admin',
        avatar: r.avatar || null,
        created_at: r.created_at,
        articlesCount: Number(r.articlesCount || 0)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST /api/users - Create new user
router.post('/', requireAuth, (req: AuthRequest, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').toLowerCase().trim();
    const password = String(req.body.password || '');
    let role = String(req.body.role || 'author').toLowerCase().trim();
    let avatar = String(req.body.avatar || '').trim();

    if (!name) {
      return res.status(400).json({ error: 'User full name is required' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      role = 'author';
    }

    // Check email uniqueness
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'A user account with this email address already exists' });
    }

    const userId = 'usr-' + crypto.randomBytes(6).toString('hex');
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    if (!avatar) {
      avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
    }

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, avatar, created_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, name, email, passwordHash, role, avatar);

    res.status(201).json({
      success: true,
      message: `User '${name}' created successfully with role '${role}'`,
      user: {
        id: userId,
        name,
        email,
        role,
        avatar,
        created_at: new Date().toISOString(),
        articlesCount: 0
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create user' });
  }
});

// 4. PUT /api/users/:id - Update user details
router.put('/:id', requireAuth, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    const name = req.body.name !== undefined ? String(req.body.name).trim() : existing.name;
    const email = req.body.email !== undefined ? String(req.body.email).toLowerCase().trim() : existing.email;
    let role = req.body.role !== undefined ? String(req.body.role).toLowerCase().trim() : existing.role;
    const avatar = req.body.avatar !== undefined ? String(req.body.avatar).trim() : existing.avatar;

    if (!name) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      role = existing.role;
    }

    // Email collision check
    if (email !== existing.email.toLowerCase()) {
      const emailCheck = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, id);
      if (emailCheck) {
        return res.status(400).json({ error: 'Email is already in use by another user account' });
      }
    }

    // Guard: Prevent demoting the last admin
    if (existing.role === 'admin' && role !== 'admin') {
      const adminCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get() as any).c;
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot change role: this is the only remaining Administrator account on the blog' });
      }
    }

    db.prepare(`
      UPDATE users
      SET name = ?, email = ?, role = ?, avatar = ?
      WHERE id = ?
    `).run(name, email, role, avatar, id);

    res.json({
      success: true,
      message: `User '${name}' updated successfully`,
      user: {
        id,
        name,
        email,
        role,
        avatar,
        created_at: existing.created_at
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update user' });
  }
});

// 5. PUT /api/users/:id/password - Change password
router.put('/:id/password', requireAuth, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(id) as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newPassword = String(req.body.password || '');
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, id);

    res.json({
      success: true,
      message: `Password for user '${user.name}' has been updated successfully`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update password' });
  }
});

// 6. DELETE /api/users/:id - Delete user
router.delete('/:id', requireAuth, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const authUser = req.user;

    // Guard 1: Prevent deleting self
    if (authUser && authUser.id === id) {
      return res.status(400).json({ error: 'You cannot delete your own active administrator account' });
    }

    const target = db.prepare('SELECT id, name, role FROM users WHERE id = ?').get(id) as any;
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Guard 2: Prevent deleting the last admin
    if (target.role === 'admin') {
      const adminCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get() as any).c;
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last remaining Administrator account on the blog' });
      }
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    res.json({
      success: true,
      message: `User '${target.name}' has been removed successfully`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete user' });
  }
});

export default router;
