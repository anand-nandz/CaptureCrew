import mongoose,{Schema,Document,Model} from "mongoose";
export enum AcceptanceStatus {
    Requested = 'requested',
    Accepted = 'accepted',
    Rejected = 'rejected'
}
export interface Vendor {
    email :string ;
    password?:string ;
    name: string ;
    companyName:string;
    city: string ;
    about: string ;
    contactinfo :Number ;
    isActive : boolean ;
    isVerified : boolean ;
    isAccepted:AcceptanceStatus;
    logo : string ;
    profilepic : string ;
    totalBooking:number;
    bookedDates:string[];
    refreshToken:string;
    totalRating:number;
}
export interface VendorDocument extends Vendor, Document {
    _id: mongoose.Types.ObjectId;
  }

  export interface VendorModel extends Model<VendorDocument> {
    // Add any static methods here if needed
  }
export interface VendorDocument extends Vendor ,Document {}

const VendorSchema = new Schema<VendorDocument>({
    email : {type : String ,required: true , unique:true},
    password : {type:String , required:true} ,
    name: { type: String, required: true },
    companyName: { type: String, required: true },
    city: { type: String, required: true },
    about: { type: String },
    contactinfo: { type: Number ,required:true , unique:true},
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isAccepted: { type: String, enum: Object.values(AcceptanceStatus), default: AcceptanceStatus.Requested },
    logo:{type:String, default:''},
    profilepic : {type:String , default:''},
    totalBooking:{type:Number},
    bookedDates:{type:[String]},
    totalRating:{type:Number,default:0},
    refreshToken: { type: String }
},{ timestamps: true })

export default mongoose.model<VendorDocument>('Vendor',VendorSchema)