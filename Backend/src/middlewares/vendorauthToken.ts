import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/userTypes';
import { Types } from 'mongoose';
 import dotenv from 'dotenv'
import { VendorRequest } from '../types/vendorTypes';
import HTTP_statusCode from '../enums/httpStatusCode';
import Messages from '../enums/errorMessage';
 dotenv.config()
interface UserJwtPayload extends JwtPayload {
  _id: string;
}

export const authenticateTokenVendor = (req: VendorRequest, res: Response, next: NextFunction): void => {
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

    const vendor = decoded as UserJwtPayload;       
    if (vendor && vendor._id) {
      req.vendor = {
        _id: new Types.ObjectId(vendor._id)
      };
      next();
    } else {
      res.status(HTTP_statusCode.NoAccess).json({ message: Messages.INVALID_PAYLOAD });
    }
  });
};
