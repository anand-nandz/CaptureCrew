import mongoose, {Document, model, Schema } from "mongoose";

export interface Reviews {
    userId: mongoose.Types.ObjectId;
    vendorId: mongoose.Types.ObjectId;
    bookingId: mongoose.Types.ObjectId;
    rating: number;
    content: string;
    date: Date;
    reply: Array<string>
}

export interface ReviewDocument extends Reviews, Document {
    _id: mongoose.Types.ObjectId;
}

const reviewSchema=new Schema<ReviewDocument>({ 
    userId:{
        type:Schema.Types.ObjectId,
        ref: 'User',
        required:true,
        index: true
    },
    vendorId:{
        type:Schema.Types.ObjectId,
        ref: 'Vendor',
        required:true,
        index: true
    },
    bookingId:{
        type:Schema.Types.ObjectId,
        ref: 'Booking',
        required:true,
        index: true
    },
    rating:{
        type:Number,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    reply:[{
        type:String
    }]
},{timestamps:true});


reviewSchema.index({vendorId: 1, userId: 1 , bookingId: 1, createdAt: -1})

export default model<ReviewDocument>('Review',reviewSchema)