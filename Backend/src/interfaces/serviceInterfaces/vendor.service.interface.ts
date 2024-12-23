import mongoose from "mongoose";
import { VendorDocument } from "../../models/vendorModel";
import { CustomizationOption, FindAllVendorsResult, IVendorLoginResponse, Vendor, VendorDetailsWithAll, VendorSession } from "../commonInterfaces";
import { PackageDocument } from "../../models/packageModel";
import { AcceptanceStatus, BlockStatus, ServiceProvided } from "../../enums/commonEnums";

export interface IVendorService{
    login(email: string,password: string): Promise<IVendorLoginResponse>;
    getSingleVendor(vendorId:string): Promise<VendorDocument>;
    getVendors(page: number, limit: number, search: string, status?: string): Promise<FindAllVendorsResult>;
    create_RefreshToken(refreshToken: string) : Promise<string>;
    registerVendor(data: {
        email: string;
        name: string;
        password: string;
        city: string;
        contactinfo: string;
        companyName: string;
        about: string;
    }): Promise<VendorSession>;
    signup(
        email: string,
        password: string,
        name: string,
        contactinfo: string,
        city: string,
        companyName: string,
        about: string
    ):Promise<{vendor: VendorDocument}>; 
    checkBlock(vendorId: string): Promise<Vendor>;
    handleForgotPassword(email: string): Promise<void>;
    newPasswordChange(token: string, password: string): Promise<void>;
    validateToken (token: string): Promise<boolean>;
    getVendorProfileService(email:string): Promise<VendorDocument>;
    updateProfileService(
        name: string, 
        contactinfo: string, 
        companyName: string, 
        city: string, 
        about: string, 
        files: Express.Multer.File | null, 
        vendorId: any
    ): Promise<VendorDocument | null>;
    passwordCheckVendor(currentPassword: string, newPassword: string, vendorId: any): Promise<void>;
    getPackages(vendorId: mongoose.Types.ObjectId): Promise<PackageDocument[]>;
    addNewPkg(
        serviceType: ServiceProvided,
        price: number,
        description: string,
        duration: number | string,
        photographerCount: number,
        videographerCount: number,
        features: string[],
        customizationOptions: CustomizationOption[],
        vendorId: mongoose.Types.ObjectId
    ): Promise<{ package: PackageDocument }>;
    updatePkg(
        vendorId: mongoose.Types.ObjectId,
        packageId: string,
        serviceType?: ServiceProvided,
        price?: number,
        description?: string,
        duration?: number | string,
        photographerCount?: number,
        videographerCount?: number,
        features?: string[],
        customizationOptions?: CustomizationOption[],
    ): Promise<{ package: PackageDocument }>;
    getAllDetails(vendorId: string):Promise<VendorDetailsWithAll>;
    showDates(vendorId: string): Promise<VendorDocument | null>;
    addDates(dates: string[], vendorId: string): Promise<{
        success: boolean;
        message: string;
        addedDates: string[];
        alreadyBookedDates: string[];
    }>;
    removeDates(dates: string[], vendorId: string): Promise<{
        success: boolean;
        removedDates: string[];
    }>;
    getRevenueDetails(dateType: string, vendorId: string , startDate?: string, endDate?: string): Promise<number[]>;
    verifyVendor (vendorId: string, status: AcceptanceStatus): Promise<{success: boolean, message: string}>;
    SVendorBlockUnblock(userId: string): Promise<BlockStatus>;

}