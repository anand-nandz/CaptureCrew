import {Document,Schema,model} from "mongoose";


export interface AdminDocument extends Document{
    email:string;
    password:string;
    wallet:number;
    refreshToken:string;
}

const adminSchema=new Schema<AdminDocument>({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    wallet:{
        type:Number, 
        default:0
    },
    refreshToken:{
        type:String
    },
},{timestamps:true})


export default model<AdminDocument>('Admin',adminSchema)

