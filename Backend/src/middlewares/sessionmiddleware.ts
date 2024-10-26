import { Request, Response, NextFunction } from 'express';

export function verifySession(req: Request, res: Response, next: NextFunction) {
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  
  if (req.session && req.session.user) {
    console.log('User data in session:', req.session.user);
    next();
  } else {
    console.log('No user data in session');
    res.status(401).json({ message: 'No session found or session expired' });
  }
}

// Use this middleware in your routes like this:
// app.use('/api/user', verifySession, userRoutes);