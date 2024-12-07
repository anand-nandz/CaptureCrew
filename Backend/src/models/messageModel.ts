import mongoose, { Schema, Document, model } from "mongoose";


export interface MessageDocument extends Document {
    conversationId: string;
    senderId: string;
    text?: string;
    imageName?: string;
    imageUrl?: string;
    isRead: boolean;
    isDeleted: boolean;
    deletedIds: string[];
    emoji?: string;
}

const messageSchema = new Schema<MessageDocument>({
    conversationId: {
        type: String,
        required: true,
    },
    senderId: {
        type: String,
        required: true
    },
    text: {
        type: String
    },
    imageName: {
        type: String
    },
    imageUrl: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedIds: [{
        type: String
    }],
    emoji: {
        type: String
    }

}, { timestamps: true });

export default model<MessageDocument>('Message', messageSchema)