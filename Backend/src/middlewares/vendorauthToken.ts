import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/userTypes';
import { Types } from 'mongoose';
 import dotenv from 'dotenv'
import { VendorRequest } from '../types/vendorTypes';
 dotenv.config()
interface UserJwtPayload extends JwtPayload {
  _id: string;
}

export const authenticateTokenVendor = (req: VendorRequest, res: Response, next: NextFunction): void => {
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

    const vendor = decoded as UserJwtPayload;  
    console.log(vendor,'vendor indecodeuathtojken middleware');
     
    if (vendor && vendor._id) {
      req.vendor = {
        _id: new Types.ObjectId(vendor._id)
      };
      next();
    } else {
      res.status(403).json({ message: 'Token payload is invalid' });
    }
  });
};
