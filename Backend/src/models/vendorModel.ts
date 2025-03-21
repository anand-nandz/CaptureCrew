import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { TransactionSchema } from "../utils/extraUtils";
import { AcceptanceStatus } from "../enums/commonEnums";
import { Transaction, Vendor } from "../interfaces/commonInterfaces";

export interface VendorDocument extends Vendor, Document {
    _id: mongoose.Types.ObjectId;
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
    reportCount?:number;
    blockReason: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

export interface VendorModel extends Model<VendorDocument> {
    // Add any static methods here if needed
}

const VendorSchema = new Schema<VendorDocument>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    companyName: { type: String, required: true },
    city: { type: String, required: true },
    about: { type: String },
    contactinfo: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isAccepted: { type: String, enum: Object.values(AcceptanceStatus), default: AcceptanceStatus.Requested },
    logo: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    totalBooking: { type: Number },
    bookedDates: { type: [String] },
    postCount: {
        type: Number,
        default: 0
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: "Post"
    }],
    walletBalance: {
        type: Number,
        default: 0
    },
    transactions: [TransactionSchema],
    totalRating: { type: Number, default: 0 },
    reportCount: {
        type: Number,
        default: 0
    },
    blockReason: {
        type: String
    },
    refreshToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model<VendorDocument, VendorModel>('Vendor', VendorSchema);