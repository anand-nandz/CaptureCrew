import { Request, Response } from "express";
import { handleError } from "../utils/handleError";
import { CustomError } from "../error/customError";
import { VendorRequest } from "../types/vendorTypes";
import postService from "../services/postService";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../types/userTypes";
import { AuthRequest } from "../types/adminTypes";



class PostController {

    async createPost(req: VendorRequest, res: Response): Promise<void> {
        try {
            const { caption, location, serviceType, status } = req.body;
            const vendorId = req.vendor?._id;

            if (!vendorId) {
                res.status(400).json({ message: 'Vendor ID is missing' });
                return;
            }
            const files = Array.isArray(req.files) ? req.files : [];

            if (!files.length) {
                res.status(400).json({ message: 'At least one image is required' });
                return;
            }
            const createdPost = await postService.addNewPost(caption, location, serviceType, status, files, vendorId)      
            res.status(200).json(createdPost)
        } catch (error) {
            handleError(res, error, 'createPost')
        }
    }

    
    async updatePost(req:VendorRequest,res:Response):  Promise<void> {
        try {
            const postId = req.params.id;
            const vendorId = req.vendor?._id;

            const {caption, location, serviceType, status, existingImages ,deletedImages} = req.body;
            
            if (!vendorId) {
                res.status(400).json({ message: 'Vendor ID is missing' });
                return;
            }
    
            if (!postId) {
                res.status(400).json({ message: 'Post ID is missing' });
                return;
            }
            const files = Array.isArray(req.files) ? req.files : [];


            const updatedPost =  await postService.updatePostService(
                postId, 
                vendorId.toString(),
                caption,
                location,
                serviceType,
                status,
                files,
                existingImages,
                deletedImages
            )

            res.status(200).json({
                success: true,
                message: 'Post updated successfully',
                data: updatedPost
            });
        } catch (error) {
            handleError(res,error,'updatePost')
        }
    }

    async getPosts(req:VendorRequest, res:Response) : Promise<void> {
        try {
            if (!req.vendor?._id) {
                throw new CustomError('Vendor not found in request', 401);
            }
            const vendorId =  new mongoose.Types.ObjectId(req.vendor._id);            
            let page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 3

            const result = await postService.getVendorPosts(vendorId, page, limit);
             
            res.status(200).json({
                status: 'success',
                data: {
                    posts: result.posts,
                    totalPages: result.totalPages,
                    currentPage : result.currentPage,
                    total: result.total
                }
            });
        } catch (error) {
            handleError(res, error, 'getPosts')
        }
    }

    async getAllPostsUser(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user?._id) {
                throw new CustomError('Vendor not found in request', 401);
            }
            const userId = new mongoose.Types.ObjectId(req.user._id);
            let page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 3;
    
            const result = await postService.displayPosts(limit, page);
            
            res.status(200).json({
                status: 'success',
                data: {
                    posts: result.posts,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    total: result.total
                }
            });
        } catch (error) {
            handleError(res, error, 'getAllPostsUser')
        }
    }

    async getVendorIdPosts(req:AuthenticatedRequest,res:Response): Promise<void>{
        try {
            if(!req.user?._id){
                throw new CustomError('User not found',404)
            }
            const vendorId = req.params.vendorId
            let page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 3;

            const result = await postService.singleVendorPosts(vendorId.toString(),page,limit)
            
            res.status(200).json({
                status : 'success',
                data: {
                    post: result.posts,
                    package: result.package,
                    vendor: result.vendor,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    total: result.total
                }
            })
            
        } catch (error) {
            handleError(res,error,'getVendorIdPosts')
        }
    }


    async getAllPostsAdmin (req: AuthRequest, res: Response): Promise<void> {
        try {           
            if (!req.admin?._id) {
                throw new CustomError('Vendor not found in request', 401);
            }
            const adminId = new mongoose.Types.ObjectId(req.admin._id);            
            let page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 3; 
            const search = req.query.search as string || ''; 
            
            const result = await postService.displayPostsAdmin(limit, page, search);
            
            res.status(200).json({
                status: 'success',
                data: {
                    posts: result.posts,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    total: result.total
                }
            });
        } catch (error) {
            handleError(res, error, 'getAllPostsAdmin')
        }
    }


 }

export default new PostController()