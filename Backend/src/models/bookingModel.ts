import mongoose, { Schema, Document } from "mongoose";
import { BookingStatus, PaymentStatus } from "../enums/commonEnums";
import { BookingInterface } from "../interfaces/commonInterfaces";

export interface BookingDocument extends BookingInterface, Document {
    _id: mongoose.Types.ObjectId;
}

const BookingSchema = new Schema<BookingDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    vendorId: {
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
        index: true,
    },
    bookingId: {
        type: String,
        required: true
    },
    clientName: {
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
    serviceType: {                    
        type: String,
        required: true
    },
    packageId: {                     
        type: Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    customizations: [{                
        type: Schema.Types.ObjectId,
        ref: 'CustomizationOption'
    }],
    startingDate: {
        type: String,
        required: true
    },
    noOfDays: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    advancePayment: {
        amount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: Object.values(PaymentStatus),
            required: true
        },
        paymentId: {
            type: String,
            required: true
        },
        paidAt: {
            type: Date,
            required: true
        },
        refundedAt: {
            type: Date,
            required: false
        }
    },
    finalPayment: {
        amount: {
            type: Number,
            required: true
        },
        dueDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: Object.values(PaymentStatus),
            required: true
        },
        paymentId: {
            type: String,
            required: false
        },
        paidAt: {
            type: Date,
            required: false
        }
    },
    bookingStatus: {
        type: String,
        enum: Object.values(BookingStatus),
        default: BookingStatus.Confirmed,
        required: true
    },
    requestedDates: [{
        type: String,
        required: false
    }],
    cancellationReason: {
        type: String,
        required: false,
        trim: true,
        maxlength: 500 
    },
    cancelledAt: {
        type: Date,
        required: false
    }
}, { timestamps: true });

BookingSchema.index({ userId: 1, vendorId: 1, startingDate: 1 });

export default mongoose.model<BookingDocument>('Booking', BookingSchema);
