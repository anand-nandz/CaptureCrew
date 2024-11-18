import mongoose, { Schema, Document, Model } from "mongoose";

export enum ServiceProvided {
    Engagement = 'Engagement',
    Wedding = 'Wedding',
    Birthday = 'Birthday Party',
    OutdoorShoot = "Outdoor Shoot"
}


export enum PostStatus {
    Draft = 'Draft',
    Published = 'Published',
    Archived = 'Archived',
    Blocked = 'Blocked'
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
    vendor_id: mongoose.Types.ObjectId
}

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