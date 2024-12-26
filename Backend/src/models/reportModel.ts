import mongoose, { Schema, Document, model } from 'mongoose';
import { ReportReason, ReportStatus, ReportType } from '../enums/commonEnums';

export interface IReport extends Document {
  reportedBy: mongoose.Types.ObjectId;
  reportId: string;
  reportedItem: {
    itemId: mongoose.Types.ObjectId;
    type: ReportType;
  };
  reportedVendor?: mongoose.Types.ObjectId;
  reportedPost?: mongoose.Types.ObjectId;
  reason: ReportReason;
  additionalDetails?: string;
  status: ReportStatus;
  createdAt: Date;
}

const ReportSchema: Schema = new Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportId: {
    type: String,
    required: true
  },
  reportedItem: {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'reportedItem.type',
      required: true
    },
    type: {
      type: String,
      enum: Object.values(ReportType),
      required: true
    }
  },
  reportedVendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  reportedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  reason: {
    type: String,
    enum: Object.values(ReportReason),
    required: true
  },
  additionalDetails: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(ReportStatus),
    default: ReportStatus.PENDING
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default model<IReport>('Report', ReportSchema);
