import express from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  userId: string;
  role: string;
  email: string;
}

export const authMiddleware: express.RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Lipsă token de autorizare' });
  }

  const token = authHeader.slice(7);

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT_SECRET nu este configurat' });
    }

    const payload = jwt.verify(token, secret) as AuthPayload;
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid sau expirat' });
  }
};

export const adminMiddleware: express.RequestHandler = (req, res, next) => {
  const user = (req as any).user as AuthPayload;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Acces interzis - Doar administratori' });
  }
  
  next();
};
