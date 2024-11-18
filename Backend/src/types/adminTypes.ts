import { Request } from 'express';
import { Types } from 'mongoose';

export interface AuthRequest extends Request {
    admin?: {
      _id: Types.ObjectId | string ;
      // role?: 'user' | 'vendor' | 'admin';
    };
  }