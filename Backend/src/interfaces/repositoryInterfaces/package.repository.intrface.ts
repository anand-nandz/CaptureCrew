import mongoose from "mongoose";
import { PackageDocument } from "../../models/packageModel";
import { ServiceProvided } from "../../enums/commonEnums";

export interface IPackageRepository {
    getPkgs(vendorId: mongoose.Types.ObjectId): Promise<PackageDocument[]>
    getById(id: string): Promise<PackageDocument | null>; 
    checkExistingPackage(
        vendorId: mongoose.Types.ObjectId, 
        serviceType: ServiceProvided
    ) : Promise<boolean>;
    create(data: Partial<PackageDocument>): Promise<PackageDocument>;
    update(id: string, data: Partial<PackageDocument>): Promise<PackageDocument | null>;


}