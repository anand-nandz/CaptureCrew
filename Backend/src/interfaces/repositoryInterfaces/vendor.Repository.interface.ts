import mongoose from "mongoose";
import { VendorDocument } from "../../models/vendorModel";
import { FindAllVendorsResult, Vendor, VendorDetailsWithAll } from "../commonInterfaces";

export interface IVendorRepository {
    getById(id: string): Promise<VendorDocument | null>; 
    create(data: Partial<VendorDocument>): Promise<VendorDocument>;
    findByEmail(email:string) : Promise< VendorDocument| null>;
    findAllVendors(page: number, limit: number, search: string, status?: string): Promise<FindAllVendorsResult>;
    update(id: string, data: Partial<VendorDocument>): Promise<VendorDocument | null>;
    findByToken(resetPasswordToken:string) : Promise< VendorDocument | null>;
    UpdatePassword(vendorId:mongoose.Types.ObjectId, hashedPassword:string) : Promise<boolean>;
    getAllPopulate(vendorId: string):Promise<VendorDetailsWithAll>;
    addDates(dates:string[],vendorId:string): Promise<{
        previousDates: string[];
        newDates: string[];
        alreadyBooked: string[];
        updatedVendor: VendorDocument;
    }>;
    removeDates(dates: string[], vendorId: string): Promise<{
        removedDates: string[];
        updatedVendor: VendorDocument;
    }>;
}