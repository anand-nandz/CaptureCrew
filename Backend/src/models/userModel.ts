import mongoose, { Schema, Document, Model } from 'mongoose';

export interface User {
  email: string;
  password?: string;
  name: string;
  googleId?: string;
  contactinfo?: number;
  isActive: boolean;
  isGoogleUser: boolean;
  image?: string;
  imageUrl?: string;
  favourite?: string[];
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

export interface UserDocument extends User, Document {
  _id: mongoose.Types.ObjectId;
}

export interface UserModel extends Model<UserDocument> {
  // Add any static methods here if needed
}

const UserSchema = new Schema<UserDocument, UserModel>({
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function() {
      return !this.isGoogleUser; 
    }
  },
  name: { type: String, required: true },
  googleId: { type: String },
  contactinfo: { type: Number },
  isActive: { type: Boolean, default: true },
  image: { type: String },
  imageUrl: { type: String },
  favourite: { type: [String] },
  isGoogleUser: { type: Boolean, default: false },
  refreshToken: { type: String },
  resetPasswordToken: {type : String},
  resetPasswordExpires: {type : Date},
}, { timestamps: true });

export default mongoose.model<UserDocument, UserModel>('User', UserSchema);