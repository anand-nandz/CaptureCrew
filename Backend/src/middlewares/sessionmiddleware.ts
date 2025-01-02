import { Request, Response, NextFunction } from 'express';

export function verifySession(req: Request, res: Response, next: NextFunction) {
  
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'No session found or session expired' });
  }
}

// Use this middleware in your routes like this:
// app.use('/api/user', verifySession, userRoutes);