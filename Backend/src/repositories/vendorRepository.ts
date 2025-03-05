import Vendor, { VendorDocument } from "../models/vendorModel";
import Post, { PostDocument } from "../models/postModel";
import Package, { PackageDocument } from "../models/packageModel";
import { BaseRepository } from "./baseRepository";
import mongoose, { Document } from "mongoose";
import { CustomError } from "../error/customError";
import { IVendorRepository } from "../interfaces/repositoryInterfaces/vendor.Repository.interface";
import { VendorDetailsWithAll } from "../interfaces/commonInterfaces";
import HTTP_statusCode from "../enums/httpStatusCode";

type VendorDocumentWithId = Document<unknown, {}, VendorDocument> &
    VendorDocument &
    Required<{ _id: mongoose.Types.ObjectId }> &
{ __v?: number };

class VendorRepository extends BaseRepository<VendorDocument> implements IVendorRepository {
    constructor() {
        super(Vendor);
    }


    findAllVendors = async(page: number, limit: number, search: string, status?: string) =>{
        try {
            const skip = (page - 1) * limit;

            let query: { [key: string]: any } = {};

            if (search) {
                query = {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                        { companyName: { $regex: search, $options: 'i' } },
                    ]
                }
            }
            if (status) {
                query.isActive = status === 'active'
            }

            const total = await Vendor.countDocuments(query);
            const vendors = await Vendor.find(query)
                .skip(skip)
                .limit(limit)
                .select('-password')
                .sort({totalRating: -1, createdAt: -1 })

            return {
                vendors,
                total,
                totalPages: Math.ceil(total / limit)
            }
        } catch (error) {
            throw error
        }
    }

    UpdatePassword = async (vendorId: mongoose.Types.ObjectId, hashedPassword: string): Promise<boolean> => {
        try {
            const result = await Vendor.updateOne(
                { _id: vendorId },
                { $set: { password: hashedPassword } }
            );
            return result.modifiedCount > 0;
        } catch (error) {
            console.error('Error in updatePassword:', error);
            throw new CustomError('Failed to update password in database', HTTP_statusCode.InternalServerError);
        }
    }

    getAllPopulate = async (vendorId: string): Promise<VendorDetailsWithAll> => {
        try {
            const vendor = await Vendor.findById(vendorId)
                .select('-password')
                .lean()
                .exec();

            if (!vendor) {
                throw new CustomError('Vendor not found', 404);
            }

            const posts = await Post.find({ vendor_id: new mongoose.Types.ObjectId(vendorId) })
                .sort({ createdAt: -1 })
                .lean()
                .exec() as PostDocument[];

            const packages = await Package.find({ vendor_id: new mongoose.Types.ObjectId(vendorId) })
                .sort({ createdAt: -1 })
                .lean()
                .exec();

            return {
                vendor,
                posts,
                packages
            };
        } catch (error) {
            console.error('Error in getAllPopulate:', error);
            throw new CustomError('Failed to getAll populated data from database', HTTP_statusCode.InternalServerError);
        }
    }

    addDates = async (dates: string[], vendorId: string): Promise<{
        previousDates: string[];
        newDates: string[];
        alreadyBooked: string[];
        updatedVendor: VendorDocument;
    }> => {
        try {
            const vendor = await Vendor.findById(vendorId);
            if (!vendor) {
                throw new CustomError('Vendor not found', 404)
            }

            const existingDatesSet = new Set(vendor.bookedDates || [])
            const newDatesToAdd = dates.filter(date => !existingDatesSet.has(date));
            const alreadyExistingDates = dates.filter(date => existingDatesSet.has(date));

            let updatedVendor: VendorDocumentWithId = vendor;
            if (newDatesToAdd.length > 0) {
                const updated = await Vendor.findByIdAndUpdate(
                    vendorId,
                    {
                        $addToSet: { bookedDates: { $each: newDatesToAdd } }
                    },
                    { new: true }
                );

                if (!updated) {
                    throw new CustomError('Failed to update vendor', HTTP_statusCode.InternalServerError)
                }
                updatedVendor = updated;
            }

            return {
                previousDates: Array.from(existingDatesSet),
                newDates: newDatesToAdd,
                alreadyBooked: alreadyExistingDates,
                updatedVendor
            };

        } catch (error) {
            console.error('Error in adding dates', error);
            throw new CustomError('Failed to add new Dates', HTTP_statusCode.InternalServerError)
        }
    }


    removeDates = async(dates: string[], vendorId: string): Promise<{
        removedDates: string[];
        updatedVendor: VendorDocument;
    }> =>{
        try {
            const vendor = await Vendor.findById(vendorId);
            if (!vendor) {
                throw new CustomError('Vendor not found', 404);
            }

            const updatedVendor = await Vendor.findByIdAndUpdate(
                vendorId,
                {
                    $pull: { bookedDates: { $in: dates } }
                },
                { new: true }
            );

            if (!updatedVendor) {
                throw new CustomError('Failed to update vendor', HTTP_statusCode.InternalServerError);
            }

            return {
                removedDates: dates,
                updatedVendor
            };
        } catch (error) {
            console.error('Error in removing dates:', error);
            throw error;
        }
    }







}

export default VendorRepository;