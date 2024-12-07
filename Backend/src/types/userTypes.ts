import { Request } from 'express';
import { Types } from 'mongoose';

export interface AuthenticatedRequest extends Request {
    user?: {
      _id: Types.ObjectId | string ;
      
      // role?: 'user' | 'vendor' | 'admin';
    };
  }

 