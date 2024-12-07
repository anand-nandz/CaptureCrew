import mongoose, { Schema, Document } from "mongoose";
import { ServiceProvided } from "./postModel";

export enum BookingAcceptanceStatus {
    Requested = 'requested',
    Accepted = 'accepted',
    Rejected = 'rejected',
    Revoked = 'revoked',
    PaymentOverdue = 'overdue'
}

export interface BookingInterface {
    vendor_id: string | mongoose.Types.ObjectId,
    user_id: string | mongoose.Types.ObjectId,
    name: string,
    email: string,
    phone: string,
    venue: string,
    bookingReqId?: string,
    serviceType: ServiceProvided,
    packageId: string | mongoose.Types.ObjectId,
    message: string,
    totalPrice: number;
    startingDate: string;
    customizations: string[];
    noOfDays: number;
    bookingStatus: BookingAcceptanceStatus;
    rejectionReason?: string;
    requestedDates?: string[];
    advancePaymentDueDate: Date;
    advancePayment: {
        amount: number;
        status: 'pending' | 'completed' | 'overdue';
        paidAt?: Date;
    };
}

export interface BookingReqDocument extends BookingInterface, Document {
    _id: mongoose.Types.ObjectId
}

const BookingRequestSchema = new Schema<BookingReqDocument>({
    vendor_id: {
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
        index: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    bookingReqId: {
        type: String,
        required: true
    }
    ,
    serviceType: {
        type: String,
        required: true
    },
    packageId: {
        type: Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    startingDate: {
        type: String,
        required: true
    },
    customizations: [{
        type: Schema.Types.ObjectId,
        ref: 'CustomizationOption' 
    }],
    noOfDays: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    bookingStatus: {
        type: String,
        enum: Object.values(BookingAcceptanceStatus),
        default: BookingAcceptanceStatus.Requested
    },
    rejectionReason: {
        type: String,
        required: function (this: BookingReqDocument) {
            return this.bookingStatus === BookingAcceptanceStatus.Rejected;
        }
    },
    advancePaymentDueDate: {
        type: Date,
        required: true
    },
    advancePayment: {
        amount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'overdue'],
            default: 'pending'
        },
        paidAt: Date
    },
    requestedDates: [{
        type: String, 
    }],
    
}, { timestamps: true })

BookingRequestSchema.index({
    vendor_id: 1,
    user_id: 1,
    startingDate: 1,
    serviceType: 1
}, { unique: true });

export default mongoose.model<BookingReqDocument>('BookingRequest', BookingRequestSchema)