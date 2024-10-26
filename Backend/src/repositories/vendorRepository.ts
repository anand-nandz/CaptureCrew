import  Vendor,{ VendorDocument } from "../models/vendorModel";
import { Document } from "mongoose";
import { BaseRepository } from "./baseRepository";
import mongoose from "mongoose";
import { CustomError } from "../error/customError";


class VendorRepository extends BaseRepository<VendorDocument>{
    constructor(){
        super(Vendor);
    }
    

    async findAllVendors(page: number, limit: number, search: string,status?:string)  {
        try {
            const skip = (page -1) * limit ;

            let query : {[key:string] : any} = {} ;
            
            if(search){
                query={
                    $or :[
                        {name: {$regex : search , $options : 'i'}},
                        {email: {$regex : search , $options : 'i'}},
                        {companyName: {$regex : search , $options : 'i'}},
                    ]
                }
            }
            if(status){
                query.isActive= status === 'active'
            }

            const total = await Vendor.countDocuments(query);
            const vendors = await Vendor.find(query)
            .skip(skip)
            .limit(limit)
            .sort({createdAt : -1})

            return {
                vendors,
                total,
                totalPages : Math.ceil(total/limit)
            }
        } catch (error) {
           throw error 
        }
    }

    async UpdatePassword(userId:mongoose.Types.ObjectId, hashedPassword:string) : Promise<boolean> {
        try {
            const result = await Vendor.updateOne(
                {_id : userId},
                {$set : {password : hashedPassword}}
            ) ;
            return result.modifiedCount > 0 ;
        } catch (error) {
            console.error('Error in updatePassword:', error);
        throw new CustomError('Failed to update password in database', 500);
        }
    }


}

export default new VendorRepository();