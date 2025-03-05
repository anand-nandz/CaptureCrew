import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/userTypes';
import { Types } from 'mongoose';
 import dotenv from 'dotenv'
import HTTP_statusCode from '../enums/httpStatusCode';
import Messages from '../enums/errorMessage';
 dotenv.config()
interface UserJwtPayload extends JwtPayload {
  _id: string;
  // role: 'user' | 'vendor' | 'admin';
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(HTTP_statusCode.Unauthorized).json({ message: Messages.AUTHENTICATION_REQUIRED });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY!, (err, decoded) => {
    if (err) {
      res.status(HTTP_statusCode.NoAccess).json({ message: Messages.TOKEN_NOT_VALID });
      return;
    }

    const user = decoded as UserJwtPayload;  
     
    if (user && user._id) {
      req.user = {
        _id: new Types.ObjectId(user._id),
        // role: user.role
      };
      next();
    } else {
      res.status(HTTP_statusCode.NoAccess).json({ message: Messages.INVALID_PAYLOAD });
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
