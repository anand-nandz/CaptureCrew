import { Transaction } from "./extraTypes";
import { CustomizationOption } from "./packageTypes";

export enum PaymentStatus {
    Pending = 'pending',
    Completed = 'completed',
    Failed = 'failed',
    Refund = 'refunded'
}

export enum BookingStatus {
    Confirmed = 'confirmed',
    Cancelled = 'cancelled',
    Completed = 'completed',
}

export type PaymentDetails = {
    amount: number;
    status: PaymentStatus;
    paymentId?: string;
    paidAt?: string; 
    refundedAt?: string
};



export type BookingConfirmed = {
    _id: string;
    bookingId: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        contactinfo?: string;
        transactions?: Transaction[];
        isActive: boolean;
    };
    vendorId: {
        _id: string;
        name: string;
        companyName: string;
        contactinfo: string;
        city: string;
        isActive: boolean;
        transactions?: Transaction[];
        bookedDates: string[];
    };
    clientName: string;
    email: string;
    phone: string;
    venue: string;
    serviceType: string;
    packageId: {
        _id: string;
        description: string;
        features: string[];
        photographerCount: number;
        price: number;
        customizationOptions: CustomizationOption[];
    };
    customizations: string[];
    startingDate: string;
    noOfDays: number;
    totalAmount: number;
    advancePayment: PaymentDetails;
    finalPayment: {
        amount: number;
        dueDate: string; 
        status: PaymentStatus;
    };
    bookingStatus: BookingStatus;
    requestedDates: string[];
    createdAt: string;
    updatedAt: string;
}