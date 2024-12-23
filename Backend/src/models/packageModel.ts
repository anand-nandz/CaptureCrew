import mongoose, {Schema, Document} from "mongoose";
import { ServiceProvided } from "../enums/commonEnums";
import { Package } from "../interfaces/commonInterfaces";


const customizationOptionSchema = new Schema({
    type: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String }
});

export interface PackageDocument extends Package, Document {
    _id: mongoose.Types.ObjectId;
}

const PackageSchema = new Schema<PackageDocument>({
    vendor_id: {
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
        index: true
    },
    serviceType: {
        type: String,
        enum: Object.values(ServiceProvided),
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    photographerCount: {
        type: Number,
        required: true,
        default: 1
    },
    videographerCount: {
        type: Number,
        default: 0
    },
    features: [{
        type: String,
        required: true
    }],
    customizationOptions: [customizationOptionSchema],
    isActive: {
        type: Boolean,
        default: true
    }
}, {timestamps: true});

// Ensure one package per service type per vendor
PackageSchema.index({ 
    vendor_id: 1, 
    serviceType: 1 
}, { 
    unique: true 
});



export default mongoose.model<PackageDocument>('Package',PackageSchema)