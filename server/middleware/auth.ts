import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'toufiq_motion_super_secure_secret_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function generateToken(payload: { id: string; email: string; role: string }): string {
  // 30 days token lifespan for smooth administration
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    req.user = decoded;
    return next();
  } catch (err: any) {
    // If token is expired, verify cryptographic HMAC signature without expiration check
    try {
      const unexpired = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as { id: string; email: string; role: string };
      if (unexpired && unexpired.id) {
        // Confirm user still exists in the database
        const user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(unexpired.id) as any;
        if (user) {
          req.user = { id: user.id, email: user.email, role: user.role };
          // Auto-renew token so subsequent client requests stay up-to-date
          const freshToken = generateToken(req.user);
          res.setHeader('X-Renewed-Token', freshToken);
          res.setHeader('Access-Control-Expose-Headers', 'X-Renewed-Token');
          return next();
        }
      }
    } catch {
      // Signature was invalid, forged, or secret mismatch
    }

    return res.status(401).json({ error: 'Unauthorized: Token has expired or is invalid' });
  }
}

