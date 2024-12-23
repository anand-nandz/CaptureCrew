import mongoose from "mongoose";
import { PackageDocument } from "../../models/packageModel";
import { PostDocument } from "../../models/postModel";
import { Vendor } from "../commonInterfaces";
import { PostStatus, ServiceProvided } from "../../enums/commonEnums";
import { ReviewDocument } from "../../models/reviewModel";

export interface IPostService {
    displayPosts(limit: number, page: number): Promise<{
        posts: Partial<PostDocument>[];
        totalPages: number;
        total: number;
        currentPage: number;
    }> ;
     singleVendorPosts(
        vendorId : string,
        page : number,
        limit : number
    ) : Promise<{
        posts: Partial<PostDocument>[];
        package: PackageDocument[]; 
        vendor: Vendor; 
        reviews: ReviewDocument[];
        totalPages: number;
        total: number;
        currentPage: number;
    }>;
    getVendorPosts(vendorId: mongoose.Types.ObjectId, limit: number, page: number): Promise<{
        posts: Partial<PostDocument>[];
        totalPages: number;
        total: number;
        currentPage: number;
    }>;
    addNewPost(
        caption: string,
        location: string,
        serviceType: ServiceProvided,
        status: PostStatus,
        files: Express.Multer.File[],
        vendorId: mongoose.Types.ObjectId
    ): Promise<{ post: PostDocument }>;
    updatePostService(
        postId: string,
        vendorId: string,
        caption?: string,
        location?: string,
        serviceType?: string,
        status?: string,
        files?: Express.Multer.File[],
        existingImages?: string,
        deletedImages?: string
    ): Promise<PostDocument>;
    SPostBlockUnblock(postId: string): Promise<PostDocument>;
    displayPostsAdmin(limit: number, page: number, search : string): Promise<{
        posts: Array<PostDocument | Record<string, any>>;
        total: number;
        totalPages: number;
        currentPage: number;
    }>
}