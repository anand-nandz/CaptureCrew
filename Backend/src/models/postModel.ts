import mongoose, { Schema, Document, Model } from "mongoose";
import { Post} from "../interfaces/commonInterfaces";
import { PostStatus, ServiceProvided } from "../enums/commonEnums";

export interface PostDocument extends Post, Document {
    _id: mongoose.Types.ObjectId;
}

const PostSchema = new Schema<PostDocument>({
    caption: { type: String, required: true },
    imageUrl: [{ type: String }],
    serviceType: {
        type: String,
        enum: Object.values(ServiceProvided),
        default: ServiceProvided.Engagement
    },
    status: {
        type: String,
        enum: Object.values(PostStatus),
        default: PostStatus.Published
    },
    likesCount: { type: Number, default: 0 },
    location: { type: String },
    vendor_id: {
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
        index: true
    },
    reportCount: {
        type: Number,
        default: 0
      },
      blockReason: {
        type: String
      }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

PostSchema.index({ vendor_id: 1, createdAt: -1 });

export interface PostUpdateData extends Partial<Omit<PostDocument, 'updatedAt'>> {
    caption?: string;
    location?: string;
    serviceType?: ServiceProvided;
    status?: PostStatus;
    imageUrl?: string[];
    updatedAt?: Date;

}

export default mongoose.model<PostDocument>('Post', PostSchema)