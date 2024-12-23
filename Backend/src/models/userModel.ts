import mongoose, { Schema, Document, Model } from 'mongoose';
import { TransactionSchema } from '../utils/extraUtils';
import { User } from '../interfaces/commonInterfaces';

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
    required: function () {
      return !this.isGoogleUser;
    }
  },
  name: { type: String, required: true },
  googleId: { type: String },
  contactinfo: { type: String },
  isActive: { type: Boolean, default: true },
  image: { type: String },
  imageUrl: { type: String },
  favourite: { type: [String] },
  isGoogleUser: { type: Boolean, default: false },
  walletBalance: {
    type: Number,
    default: 0
  },
  transactions: [TransactionSchema],
  refreshToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

export default mongoose.model<UserDocument, UserModel>('User', UserSchema);