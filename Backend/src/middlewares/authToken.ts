import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/userTypes';
import { Types } from 'mongoose';
 import dotenv from 'dotenv'
 dotenv.config()
interface UserJwtPayload extends JwtPayload {
  _id: string;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY!, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err);
      res.status(403).json({ message: 'Token is not valid' });
      return;
    }

    const user = decoded as UserJwtPayload;  
    console.log(user,'user indecodeuathtojken middleware');
     
    if (user && user._id) {
      req.user = {
        _id: new Types.ObjectId(user._id)
      };
      next();
    } else {
      res.status(403).json({ message: 'Token payload is invalid' });
    }
  });
};
