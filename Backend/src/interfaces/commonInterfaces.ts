import mongoose, { Model, Types } from "mongoose";
import { UserDocument } from "../models/userModel";
import { AcceptanceStatus, BookingAcceptanceStatus, BookingStatus, PaymentMethod, PaymentStatus, PaymentType, PostStatus, ServiceProvided, TransactionType } from "../enums/commonEnums";
import { PostDocument } from "../models/postModel";


export interface User {
    email: string;
    password?: string;
    name: string;
    googleId?: string;
    contactinfo?: string;
    isActive: boolean;
    isGoogleUser: boolean;
    image?: string;
    imageUrl?: string;
    favourite?: string[];
    walletBalance: number;
    transactions?: Transaction[];
    refreshToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}


export interface IDecodedData {
    name: string;
    email: string;
    picture?: string;
    sub: string
}

export interface IUserSession {
    email: string;
    password: string;
    name: string;
    contactinfo: string;
    otpCode: string
    otpSetTimestamp: number;
    otpExpiry: number;
    resendTimer: number;
}

export interface ILoginResponse {
    user: UserDocument;
    message: string
    isNewUser: boolean;
    token: string;
    refreshToken: string;
}

export interface GoogleUserData {
    email: string;
    name: string;
    googleId: string;
    picture?: string;
}

export interface Transaction {
    amount: number;
    transactionType: TransactionType;
    paymentType: PaymentType;
    paymentMethod: PaymentMethod,
    paymentId?: string,
    description?: string;
    bookingId?: string;
    createdAt: Date;
    status: PaymentStatus;
}

export interface Post {
    caption: string;
    imageUrl?: string[];
    serviceType: ServiceProvided;
    status?: PostStatus;
    likesCount?: number;
    location?: string;
    createdAt: Date;
    updatedAt: Date;
    vendor_id: mongoose.Types.ObjectId;
    reportCount: number;
    blockReason?: string
}

// Vendor

export interface Vendor {
    email: string;
    password?: string;
    name: string;
    companyName: string;
    city: string;
    about: string;
    contactinfo: string;
    isActive: boolean;
    isVerified: boolean;
    isAccepted: AcceptanceStatus;
    logo: string;
    imageUrl: string;
    totalBooking: number;
    bookedDates: string[];
    postCount: number;
    refreshToken: string;
    totalRating: number;
    walletBalance: number;
    transactions?: Transaction[];
    posts?: Types.ObjectId[];
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}


//BookingReq


export interface BookingReqInterface {
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


//BookingConfirmed


export interface BookingInterface {
    userId: string | mongoose.Types.ObjectId;
    vendorId: string | mongoose.Types.ObjectId;
    bookingId: string;
    clientName: string;
    email: string;
    phone: string;
    venue: string;
    serviceType: string;
    packageId: string | mongoose.Types.ObjectId;
    customizations: (string | mongoose.Types.ObjectId)[];
    startingDate: string;
    noOfDays: number;
    totalAmount: number;
    advancePayment: {
        amount: number;
        status: PaymentStatus;
        paymentId: string;
        paidAt: Date;
        refundedAt?: Date
    };
    finalPayment: {
        amount: number;
        dueDate: Date;
        status: PaymentStatus;
        paymentId?: string;
        paidAt?: Date;
    };
    bookingStatus: BookingStatus;
    requestedDates: string[];
    cancellationReason?: string;
    cancelledAt?: Date;
}



export interface PaymentData {
    sbooking: {
        _id: string;
        requestedDates: string;
        vendorId: {
            _id: string;
        };
        finalPayment?: {
            amount: number;
        };
    };
    _id:string;
    paymentType: string;
}


export interface RefundResult {
    success: boolean;
    refundId: string;
}

export interface CancelBookingResult {
    success: boolean;
    userRefundAmount: number;
    vendorAmount: number;
    reason?: string;
  }

export interface OTP {
    otp: string | undefined;
    email: string;
    otpSetTimestamp: number | undefined
}


  
  export interface FindAllVendorsResult {
    vendors:( Vendor | undefined)[]
    totalPages: number;
    total: number;
}
  
  export interface IVendorLoginResponse {
    vendor: object,
    message: string,
    isNewVendor: boolean,
    token: string,
    refreshToken: string
}


export interface CustomizationOption {
    _id: string;
    type: string;
    description: string;
    price: number;
    unit?: string;
}


//Package

export interface Package {
    vendor_id: string | mongoose.Types.ObjectId;
    serviceType: ServiceProvided;
    price: number;
    description: string;
    duration: number;  // in hours
    photographerCount: number;
    videographerCount: number;
    features: string[];
    customizationOptions: CustomizationOption[],
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}


export interface VendorDetailsWithAll {
    vendor: Omit<Vendor, 'password'>; 
    posts: PostDocument[]; 
    packages: Package[]; 
    imageUrl?: string;
}

export interface BookingVendorResponse {
    success: boolean;
    bookingRequest: BookingReqInterface[] | null;
    bookingConfirmed: BookingInterface[] | null;
}


export interface VendorSession {
    otpSetTimestamp: number | undefined;
    email: string;
    password: string;
    name: string;
    city: string;
    contactinfo: string;
    companyName: string;
    about: string;
    otpCode: string | undefined
    otpExpiry: number;
    resendTimer: number;
}


export interface AdminLoginResponse {
    token: string;
    refreshToken: string;
    adminData: object;
    message: string
  }