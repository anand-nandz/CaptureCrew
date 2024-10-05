import mongoose,{Schema,Document} from "mongoose";

export interface Vendor {
    email :string ;
    password?:string ;
    name: string ;
    city: string ;
    about: string ;
    contactinfo :Number ;
    isActive : boolean ;
    isVerified : boolean ;
    verificationRequest : boolean ;
    logo : string ;
    profilepic : string ;
    totalBooking:number;
    bookedDates:string[];
    refreshToken:string;
    totalRating:number;
}

export interface VendorDocument extends Vendor ,Document {}

const VendorSchema = new Schema<VendorDocument>({
    email : {type : String ,required: true , unique:true},
    password : {type:String , required:true} ,
    name: { type: String, required: true },
    city: { type: String, required: true },
    about: { type: String },
    contactinfo: { type: Number ,required:true , unique:true},
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationRequest: { type: Boolean},
    logo:{type:String, default:''},
    profilepic : {type:String , default:''},
    totalBooking:{type:Number},
    bookedDates:{type:[String]},
    totalRating:{type:Number,default:0},
    refreshToken: { type: String }
})

export default mongoose.model<VendorDocument>('Vendor',VendorSchema)