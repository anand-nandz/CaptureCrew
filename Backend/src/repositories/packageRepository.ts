import mongoose from "mongoose";
import Package, { PackageDocument } from "../models/packageModel";
import { BaseRepository } from "./baseRepository";
import { CustomError } from "../error/customError";
import { ServiceProvided } from "../enums/commonEnums";
import { IPackageRepository } from "../interfaces/repositoryInterfaces/package.repository.intrface";


class PackageRepository extends BaseRepository<PackageDocument> implements IPackageRepository{
    constructor(){
        super(Package)
    }

    checkExistingPackage = async(
        vendorId: mongoose.Types.ObjectId, 
        serviceType: ServiceProvided
    ) : Promise<boolean> =>{
        const existingPackage = await Package.findOne({
            vendor_id: vendorId,
            serviceType: serviceType
        });
        return !!existingPackage
    }

    getPkgs = async(vendorId: mongoose.Types.ObjectId): Promise<PackageDocument[]> =>{
        try {
            const packages = await Package.find({vendor_id: vendorId})
            
            return packages
        } catch (error) {
            console.error('Error in getting package details')
            throw new CustomError('Failed to get packages from database',500)
        }
    }
    
}

export default PackageRepository;