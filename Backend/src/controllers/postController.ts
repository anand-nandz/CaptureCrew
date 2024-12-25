import { Request, Response } from "express";
import { handleError } from "../utils/handleError";
import { CustomError } from "../error/customError";
import { VendorRequest } from "../types/vendorTypes";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../types/userTypes";
import { AuthRequest } from "../types/adminTypes";
import { IPostService } from "../interfaces/serviceInterfaces/post.Service.interface";
import HTTP_statusCode from "../enums/httpStatusCode";
import Messages from "../enums/errorMessage";


class PostController {

    private postService: IPostService;
    constructor(postService: IPostService){
        this.postService = postService
    }

    createPost = async(req: VendorRequest, res: Response): Promise<void> =>{
        try {
            const { caption, location, serviceType, status } = req.body;
            const vendorId = req.vendor?._id;

            if (!vendorId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.VENDOR_ID_MISSING });
                return;
            }
            const files = Array.isArray(req.files) ? req.files : [];

            if (!files.length) {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'At least one image is required' });
                return;
            }
            const createdPost = await this.postService.addNewPost(caption, location, serviceType, status, files, vendorId)      
            res.status(HTTP_statusCode.OK).json(createdPost)
        } catch (error) {
            handleError(res, error, 'createPost')
        }
    }

    
    updatePost = async(req:VendorRequest,res:Response): Promise<void> =>{
        try {
            const postId = req.params.id;
            const vendorId = req.vendor?._id;

            const {caption, location, serviceType, status, existingImages ,deletedImages} = req.body;
            
            if (!vendorId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.VENDOR_ID_MISSING });
                return;
            }
    
            if (!postId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.POST_ID_MISSING });
                return;
            }
            const files = Array.isArray(req.files) ? req.files : [];


            const updatedPost =  await this.postService.updatePostService(
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

            res.status(HTTP_statusCode.OK).json({
                success: true,
                message: 'Post updated successfully',
                data: updatedPost
            });
        } catch (error) {
            handleError(res,error,'updatePost')
        }
    }

    getPosts = async(req:VendorRequest, res:Response) : Promise<void> =>{
        try {
            if (!req.vendor?._id) {
                throw new CustomError(Messages.VENDOR_NOT_FOUND, HTTP_statusCode.Unauthorized);
            }
            const vendorId =  new mongoose.Types.ObjectId(req.vendor._id);            
            let page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 3

            const result = await this.postService.getVendorPosts(vendorId, page, limit);
             
            res.status(HTTP_statusCode.OK).json({
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

    getAllPostsUser = async(req: AuthenticatedRequest, res: Response): Promise<void>=> {
        try {
            if (!req.user?._id) {
                throw new CustomError(Messages.VENDOR_NOT_FOUND, HTTP_statusCode.Unauthorized);
            }
            const userId = new mongoose.Types.ObjectId(req.user._id);
            let page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 3;
    
            const result = await this.postService.displayPosts(limit, page);
            
            res.status(HTTP_statusCode.OK).json({
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

    getVendorIdPosts = async(req:AuthenticatedRequest,res:Response): Promise<void> =>{
        try {
            if(!req.user?._id){
                throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.NotFound)
            }
            const vendorId = req.params.vendorId
            
            let page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 3;

            const result = await this.postService.singleVendorPosts(vendorId.toString(),page,limit)     
                   
            res.status(HTTP_statusCode.OK).json({
                status : 'success',
                data: {
                    post: result.posts,
                    package: result.package,
                    review: result.reviews,
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


    getAllPostsAdmin = async(req: AuthRequest, res: Response): Promise<void> =>{
        try {           
            // if (!req.admin?._id) {
            //     throw new CustomError('Admin not found', 401);
            // }
            let page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 3; 
            const search = req.query.search as string || ''; 
            
            const result = await this.postService.displayPostsAdmin(limit, page, search);
            
            res.status(HTTP_statusCode.OK).json({
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

export default PostController