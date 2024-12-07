import mongoose, { Schema, Document, model } from "mongoose";

export interface ConversationDocument extends Document {
  members: string[]; 
  recentMessage: string;
}

const conversationSchema = new Schema<ConversationDocument>(
  {
    members: [
      {
        type: String,
        required: true,
      },
    ],
    recentMessage: {
      type: String,
      required: false, 
    },
  },
  { timestamps: true }
);

export default model<ConversationDocument>("Conversation", conversationSchema);
