import mongoose from "mongoose";
import { PostDocument } from "../../models/postModel";

export interface IPostRepository {
    getAllPosts(page: number, limit: number): Promise<{
        posts: PostDocument[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    getSingleVendorPost(vendorId: string, page: number, limit: number): Promise<{
        vendorPosts: PostDocument[],
        total: number;
        totalPages: number;
        currentPage: number
    }>;
    getById(id: string): Promise<PostDocument | null>; 
    update(id: string, data: Partial<PostDocument>): Promise<PostDocument | null>;
    create(data: Partial<PostDocument>): Promise<PostDocument>;
    getVendorPosts(
        vendorId: mongoose.Types.ObjectId,
        page: number,
        limit: number
    ):Promise <{
        posts :PostDocument[],
        total: number;
        totalPages: number;
        currentPage: number
    }>;
    findByIdAndUpdate(
        id: string,
        updateData: Partial<PostDocument>,
        options: { new: boolean }
    ): Promise<PostDocument | null>; 
    getAllPostsAd(limit: number, page: number, search?: string): Promise<{
        posts: Array<PostDocument | Record<string, any>>;
        total: number;
        totalPages: number;
        currentPage: number;
    }>

}