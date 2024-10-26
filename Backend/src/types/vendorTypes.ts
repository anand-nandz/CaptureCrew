import { Request } from 'express';
import { Types } from 'mongoose';

export interface VendorRequest extends Request {
    vendor?: {
        _id: Types.ObjectId;
    };
}
