import Post, { PostDocument } from "../models/postModel";
import { BaseRepository } from "./baseRepository";
import mongoose from "mongoose";
import { IPostRepository } from "../interfaces/repositoryInterfaces/post.repository.interface";

class PostRepository extends BaseRepository<PostDocument> implements IPostRepository {
    constructor() {
        super(Post)
    }
    getVendorPosts = async(
        vendorId: mongoose.Types.ObjectId,
        page: number,
        limit: number
    ):Promise <{
        posts : PostDocument[],
        total: number;
        totalPages: number;
        currentPage: number
    }> =>{
        try {
            const skip = (page - 1) * limit;

            const total = await Post.find().countDocuments({ vendor_id: vendorId });

            if (total === 0) {
                return {
                    posts: [],
                    total: 0,
                    totalPages: 0,
                    currentPage: 1
                };
            }

            const totalPages = Math.ceil(total / limit);

            // Validate page number
            const validPage = Math.min(Math.max(1, page), totalPages);
            const validSkip = (validPage - 1) * limit;

            const posts = await Post.find({ vendor_id: vendorId })
                .sort({ createdAt: -1 })
                // .skip(validSkip)
                // .limit(limit)
                .lean<PostDocument[]>();

            return {
                posts,
                total: posts.length,
                totalPages: 1,
                currentPage: 1
            };
        } catch (error) {
            console.error('Error in getVendorPosts repository:', error);
            throw error;
        }
    }


    getAllPosts= async(
        page: number,
        limit: number
    ): Promise<{
        posts: PostDocument[];
        total: number;
        totalPages: number;
        currentPage: number;
    }> => {
        try {
            const skip = (page - 1) * limit;

            const total = await Post.find().countDocuments();

            if (total === 0) {
                return {
                    posts: [],
                    total: 0,
                    totalPages: 0,
                    currentPage: 1
                };
            }

            const totalPages = Math.ceil(total / limit);

            const validPage = Math.min(Math.max(1, page), totalPages);
            const validSkip = (validPage - 1) * limit;

            const posts = await Post.find()
                .sort({ createdAt: -1 })
                .populate('vendor_id', 'name companyName email city about contactinfo imageUrl totalRating isActive') 
                .lean<PostDocument[]>();

            return {
                posts,
                total: posts.length,
                totalPages: 1,
                currentPage: 1
            };
        } catch (error) {
            console.error('Error in getVendorPosts repository:', error);
            throw error;
        }
    }


    getSingleVendorPost = async(
        vendorId: string,
        page: number,
        limit: number
    ) :Promise<{
        vendorPosts: PostDocument[],
        total: number;
        totalPages: number;
        currentPage: number
    }> =>{
        try {
            const skip = (page - 1) * limit;
            const total = await Post.countDocuments({ vendor_id: vendorId });
            if (total === 0) {
                return {
                    vendorPosts: [],
                    total: 0,
                    totalPages: 0,
                    currentPage: 1
                };
            }

            const vendorPosts = await Post.find({ vendor_id: vendorId })
                .sort({ createdAt: -1 })
                // .skip(skip)
                // .limit(limit)
                .populate('vendor_id', 'name companyName city about contactinfo imageUrl')
                .lean<PostDocument[]>();

            const totalPages = Math.ceil(total / limit);

            return {
                vendorPosts,
                total,
                totalPages,
                currentPage: page
            };
        } catch (error) {
            console.error('Error in getSingleVendorPosts repository', error);
            throw error
        }
    }


    getAllPostsAd = async(
        limit: number,
        page: number,
        search?: string
    ): Promise<{
        posts: Array<PostDocument | Record<string, any>>;
        total: number;
        totalPages: number;
        currentPage: number;
    }> =>{
        try {
            const query: any = {};

            if (search && search.trim()) {
                const searchRegex = new RegExp(search.trim(), 'i');
                query['$or'] = [
                    { 'vendor_id.name': searchRegex },
                    { 'vendor_id.companyName': searchRegex },
                    { 'vendor_id.city': searchRegex },
                ];
            }
            const skip = (page - 1) * limit;

            const posts = await Post.find(query)
                .sort({ createdAt: -1 })
                .populate('vendor_id', 'name email companyName city about contactinfo imageUrl')
                .lean();

            const mappedPosts = posts.map(post => ({
                ...post,
                vendor: post.vendor_id, 
            }));

            return {
                posts: mappedPosts,
                total: posts.length,
                totalPages: 1,
                currentPage: 1
            };
        } catch (error) {
            console.error('Error in getVendorPosts repository:', error);
            throw error;
        }
    }

    findByIdAndUpdate = async(
        id: string,
        updateData: Partial<PostDocument>,
        options: { new: boolean }
    ): Promise<PostDocument | null> =>{
        try {
            return await Post.findByIdAndUpdate(id, updateData, options).exec();
        } catch (error) {
            console.error('Error in findByIdAndUpdate:', error);
            throw error;
        }
    }


    // findPostsByVendorId(vendor_id: string) {
    //     return Post.find({ vendor_id });
    // }
}

export default PostRepository;