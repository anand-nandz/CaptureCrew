import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
 import dotenv from 'dotenv'
import { AuthRequest } from '../types/adminTypes';
 dotenv.config()
interface UserJwtPayload extends JwtPayload {
  _id: string;
  // role: 'user' | 'vendor' | 'admin';
}

export const authTokenAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY!, (err, decoded) => {
    if (err) {
      res.status(401).json({ message: 'Token is not valid' });
      return;
    }
   

    const admin = decoded as UserJwtPayload;  
     
     
    if (admin && admin._id) {
      req.admin = {
        _id: new Types.ObjectId(admin._id),
        // role: user.role
      };
      next();
    } else {
      res.status(403).json({ message: 'Token payload is invalid' });
    }
  });
};


// export const authorizeRoles = (...roles: ('user' | 'vendor' | 'admin')[]) => {
//   return (req: AuthenticatedRequest, res: Response, next: NextFunction)  => {
//       if (!req.user || !req.user.role) {
//           return res.status(403).json({ message: 'Access denied' });
//       }

//       if (!roles.includes(req.user.role)) {
//           return res.status(403).json({ 
//               message: `Role (${req.user.role}) is not allowed to access this resource`
//           });
//       }

//       next();
//   };
// };
