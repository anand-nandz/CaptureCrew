import { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { PaymentMethod, PaymentType, TransactionType } from '../enums/commonEnums';

const generateUniqueId = (prefix: string): string => {
    const uniqueId = uuidv4().replace(/-/g, '').substring(0, 10);
    return `${prefix}${uniqueId.toUpperCase()}`;
};

export default generateUniqueId;


export const TransactionSchema = new Schema({
    amount: { 
        type: Number, 
        required: true 
    },
    transactionType: {
        type: String,
        enum: Object.values(TransactionType),
        required: true
    },
    paymentType: {
        type: String,
        enum: Object.values(PaymentType),
        required: true
    },
    paymentMethod: {
        type: String,
        enum: Object.values(PaymentMethod),
        required: true
    },
    paymentId: {
        type: String,
        required: false
    },
    description: { 
        type: String 
    },
    bookingId: {
        type: String, 
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending', 'completed'],
        default: 'pending'
    }
});


export interface DateRangeQuery {
    date: string;
    startDate?: string;
    endDate?: string;
  }
  