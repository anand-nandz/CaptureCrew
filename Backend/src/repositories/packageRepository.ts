import mongoose from "mongoose";
import Package, { PackageDocument } from "../models/packageModel";
import { BaseRepository } from "./baseRepository";
import { ServiceProvided } from "../models/postModel";
import { CustomError } from "../error/customError";


class PackageRepository extends BaseRepository<PackageDocument>{
    constructor(){
        super(Package)
    }

    async checkExistingPackage (
        vendorId: mongoose.Types.ObjectId, 
        serviceType: ServiceProvided
    ) : Promise<boolean>{
        const existingPackage = await Package.findOne({
            vendor_id: vendorId,
            serviceType: serviceType
        });
        return !!existingPackage
    }

    async getPkgs(vendorId: mongoose.Types.ObjectId) {
        try {
            const packages = await Package.find({vendor_id: vendorId})
            
            return packages
        } catch (error) {
            console.error('Error in getting package details')
            throw new CustomError('Failed to get packages from database',500)
        }
    }
    
}

export default new PackageRepository();