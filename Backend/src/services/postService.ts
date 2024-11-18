import { CustomError } from "../error/customError"
import { s3Service } from "./s3Service";
import { PostDocument, PostStatus, PostUpdateData, ServiceProvided } from "../models/postModel";
import mongoose from "mongoose";
import postRepository from "../repositories/postRepository";
import { ImageService } from "./imageService";
import { validatePostInput } from "../validations/postValidation";
import packageRepository from "../repositories/packageRepository";
import { ObjectId } from 'mongodb';
import vendorRepository from "../repositories/vendorRepository";

class PostService {
    private imageService: ImageService;

    constructor() {
        this.imageService = new ImageService()
    }

    async addNewPost(
        caption: string,
        location: string,
        serviceType: ServiceProvided,
        status: PostStatus,
        files: Express.Multer.File[],
        vendorId: mongoose.Types.ObjectId
    ): Promise<{ post: PostDocument }> {
        try {

            const validationResult = await validatePostInput({
                caption,
                location,
                serviceType,
                status
            });

            if (!validationResult.isValid) {
                throw new CustomError(
                    `Validation failed : ${validationResult.errors?.join(', ')}`,
                    400
                )
            }

            const processedImages = await Promise.all(
                files.map(async (file) => {
                    try {
                        await this.imageService.validateImage(file)

                        const compressedBuffer = await this.imageService.compressImage(file);
                        return {
                            originalFile: file,
                            compressedBuffer
                        }
                    } catch (error) {
                        console.error(`Error processing image: ${file.originalname}`, error);
                        throw new CustomError(
                            `Failed to process image: ${file.originalname}`,
                            500
                        );

                    }
                })
            );



            const uploadUrls = await Promise.all(
                processedImages.map(async (processedImage) => {
                    const compressedFile = {
                        ...processedImage.originalFile,
                        buffer: processedImage.compressedBuffer
                    };

                    return await s3Service.uploadToS3(
                        'captureCrew/vendor/posts/',
                        compressedFile
                    )

                })
            );


            const postData = {
                caption,
                location,
                serviceType,
                status,
                imageUrl: uploadUrls,
                vendor_id: vendorId,
                createdAt: new Date()
            }



            const createdPost = await postRepository.create(postData)

            return { post: createdPost };


        } catch (error) {
            console.error('Error while creating new post', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to create new post', 500);
        }
    }

    async getVendorPosts(
        vendorId: mongoose.Types.ObjectId,
        limit: number,
        page: number
    ) {
        try {
            const result = await postRepository.getVendorPosts(vendorId, page, limit);

            const postWithSignedUrls = await Promise.all(
                result.posts.map(async (post) => {
                    try {
                        let postObject = post;
                        if (post.imageUrl && Array.isArray(post.imageUrl)) {
                            const signedImageUrls = await Promise.all(
                                post.imageUrl.map(async (imageFileName) => {
                                    try {
                                        return await s3Service.getFile(
                                            'captureCrew/vendor/posts/',
                                            imageFileName
                                        )
                                    } catch (error) {
                                        console.error(`Error getting signed URL for image ${imageFileName}:`, error);
                                        return null;
                                    }
                                })
                            )

                            const validSignedUrls = signedImageUrls.filter(url => url !== null);

                            return {
                                ...postObject,
                                imageUrl: validSignedUrls
                            }
                        }

                        return postObject;

                    } catch (error) {
                        console.error('Error processing post:', error);
                        return post;
                    }
                })
            );


            return {
                posts: postWithSignedUrls,
                totalPages: result.totalPages,
                total: result.total,
                currentPage: result.currentPage
            }


        } catch (error) {
            console.error('Error in getVendorPosts:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to fetch vendor posts', 500);
        }
    }





    async displayPosts(
        limit: number,
        page: number
    ) {
        try {
            const result = await postRepository.getAllPosts(page, limit);
            
            const postWithSignedUrls = await Promise.all(
                result.posts.map(async (post) => {
                    try {
                        let postObject = post;
                        if (post.imageUrl && Array.isArray(post.imageUrl)) {
                            const signedImageUrls = await Promise.all(
                                post.imageUrl.map(async (imageFileName) => {
                                    try {
                                        return await s3Service.getFile(
                                            'captureCrew/vendor/posts/',
                                            imageFileName
                                        )
                                    } catch (error) {
                                        console.error(`Error getting signed URL for image ${imageFileName}:`, error);
                                        return null;
                                    }
                                })
                            )
                            const validSignedUrls = signedImageUrls.filter(url => url !== null);
                            return {
                                ...postObject,
                                imageUrl: validSignedUrls,
                                vendor: post.vendor_id 
                            }
                        }
                        return {
                            ...postObject,
                            vendor: post.vendor_id 
                        };
                    } catch (error) {
                        console.error('Error processing post:', error);
                        return post;
                    }
                })
            );



            return {
                posts: postWithSignedUrls,
                totalPages: result.totalPages,
                total: result.total,
                currentPage: result.currentPage
            }
        } catch (error) {
            console.error('Error in getVendorPosts:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to fetch vendor posts', 500);
        }
    }


    async singleVendorPosts(
        vendorId : string,
        page : number,
        limit : number
    ){
        try {
            const result = await postRepository.getSingleVendorPost(vendorId,page,limit)
           
            const pkg = await packageRepository.getPkgs(new ObjectId(vendorId))            
            const vendorDetails = await vendorRepository.getById(vendorId)
            if(!vendorDetails){
                throw new CustomError('Wrong VendorId',404)
            }
            let processedVendorDetails = vendorDetails;

            const postWithSignedUrls = await Promise.all(
                result.vendorPosts.map(async (post) => {
                    try {
                        let postObject = post;
                        if (post.imageUrl && Array.isArray(post.imageUrl)) {
                            const signedImageUrls = await Promise.all(
                                post.imageUrl.map(async (imageFileName) => {
                                    try {
                                        return await s3Service.getFile(
                                            'captureCrew/vendor/posts/',
                                            imageFileName
                                        )
                                    } catch (error) {
                                        console.error(`Error getting signed URL for image ${imageFileName}:`, error);
                                        return null;
                                    }
                                })
                            )
                            const validSignedUrls = signedImageUrls.filter(url => url !== null);
                            return {
                                ...postObject,
                                imageUrl: validSignedUrls,
                                vendor: post.vendor_id 
                            }
                        }
                        return {
                            ...postObject,
                            vendor: post.vendor_id 
                        };
                    } catch (error) {
                        console.error('Error processing post:', error);
                        return post;
                    }
                })
            );

            if(vendorDetails?.imageUrl) {
                try {
                    const imageUrl = await s3Service.getFile('captureCrew/vendor/photo/',vendorDetails?.imageUrl);
                    processedVendorDetails = {
                        ...vendorDetails.toObject(),
                        imageUrl: imageUrl
                    };
                } catch (error) {
                    console.error('Error generating signed URL:', error);
                }
            }            

            return {
                posts : postWithSignedUrls,
                package : pkg,
                vendor: processedVendorDetails,
                totalPages: result.totalPages,
                total: result.total,
                currentPage: result.currentPage
            }
            
        } catch (error) {
            console.error('Error in getting single VendorId posts:',error);
            if( error instanceof CustomError){
                throw error;
            }
            throw new CustomError("Failed to fetch VendorId Posts",500)
        }
    }



    async displayPostsAdmin(
        limit: number,
        page: number,
        search : string
    ) {
        try {
            const result = await postRepository.getAllPostsAd(limit, page, search);            
            const postWithSignedUrls = await Promise.all(
                result.posts.map(async (post) => {
                    try {
                        let postObject = post;
                        if (post.imageUrl && Array.isArray(post.imageUrl)) {
                            const signedImageUrls = await Promise.all(
                                post.imageUrl.map(async (imageFileName) => {
                                    try {
                                        return await s3Service.getFile(
                                            'captureCrew/vendor/posts/',
                                            imageFileName
                                        )
                                    } catch (error) {
                                        console.error(`Error getting signed URL for image ${imageFileName}:`, error);
                                        return null;
                                    }
                                })
                            )
                            const validSignedUrls = signedImageUrls.filter(url => url !== null);
                            return {
                                ...postObject,
                                imageUrl: validSignedUrls,
                                vendor: post.vendor_id 
                            }
                        }
                        return {
                            ...postObject,
                            vendor: post.vendor_id 
                        };
                    } catch (error) {
                        console.error('Error processing post:', error);
                        return post;
                    }
                })
            );



            return {
                posts: postWithSignedUrls,
                totalPages: result.totalPages,
                total: result.total,
                currentPage: result.currentPage
            }
        } catch (error) {
            console.error('Error in getVendorPosts:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to fetch vendor posts', 500);
        }
    }



    async updatePostService(
        postId: string,
        vendorId: string,
        caption?: string,
        location?: string,
        serviceType?: string,
        status?: string,
        files?: Express.Multer.File[],
        existingImages?: string,
        deletedImages?: string
    ): Promise<PostDocument> {
        try {
            const existingPost = await postRepository.getById(postId);
            
            if (!existingPost) {
                throw new CustomError('Post not found', 404);
            }
            if (existingPost.vendor_id.toString() !== vendorId) {
                throw new CustomError('Unauthorized to edit this post', 403);
            }

            const extractFilename = (url: string): string => {
                if (url.includes('?')) {
                    const match = url.match(/\/([^/?]+)\?/);
                    return match ? match[1] : url;
                }
                const parts = url.split('/');
                return parts[parts.length - 1];
            };
    
            // Parse existing and deleted images
            const remainingImages = existingImages 
            ? existingImages.split(',').map(url => extractFilename(url))
            : [];
        
        const imagesToDelete = deletedImages 
            ? deletedImages.split(',').map(url => extractFilename(url))
            : [];

    
            // Delete removed images from S3
            if (imagesToDelete.length > 0) {
                await Promise.all(
                    imagesToDelete.map(async (filename) => {
                        try {
                            const key = `captureCrew/vendor/posts/${filename}`;
                            await s3Service.deleteFromS3(key);
                        } catch (error) {
                            console.error(`Failed to delete image: ${filename}`, error);
                        }
                    })
                );
            }
    
            // Handle new file uploads
            let newUploadUrls: string[] = [];
            if (files && files.length > 0) {
                const processedImages = await Promise.all(
                    files.map(async (file) => {
                        await this.imageService.validateImage(file);
                        const compressedBuffer = await this.imageService.compressImage(file);
                        return {
                            originalFile: file,
                            compressedBuffer
                        };
                    })
                );
    
                newUploadUrls = await Promise.all(
                    processedImages.map(async (processedImage) => {
                        const compressedFile = {
                            ...processedImage.originalFile,
                            buffer: processedImage.compressedBuffer
                        };
                        const uploadResult = await s3Service.uploadToS3(
                            'captureCrew/vendor/posts/',
                            compressedFile
                        );
                        return uploadResult.split('/').pop()?.split('?')[0] || '';
                    })
                );
            }
            
            // Combine remaining and new images
            const finalImages = [...remainingImages, ...newUploadUrls];
    
            // Validate final image count
            if (finalImages.length < 4 || finalImages.length > 6) {
                throw new CustomError(
                    `Total images must be between 4 and 6. Current: ${finalImages.length}`,
                    400
                );
            }
    
            // Prepare update data
            const updateData: PostUpdateData = {
                ...(caption !== undefined && { caption }),
                ...(location !== undefined && { location }),
                ...(serviceType !== undefined && { serviceType: serviceType as ServiceProvided }),
                ...(status !== undefined && { status: status as PostStatus }),
                imageUrl: finalImages,
                updatedAt: new Date()
            };
    
            // Update post in database
            const updatedPost = await postRepository.findByIdAndUpdate(
                postId,
                updateData,
                { new: true }
            );
    
            if (!updatedPost) {
                throw new CustomError('Failed to update post', 500);
            }
    
            return updatedPost;
    
        } catch (error) {
            console.error('Error while updating post:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to update post', 500);
        }
    }


    async SPostBlockUnblock(postId: string): Promise<any> {
        try {
            const post = await postRepository.getById(postId);
            
            if (!post) {
                throw new CustomError('Post not Found', 404);
            }
            
            // Toggle between Published and Blocked status
            post.status = post.status === PostStatus.Blocked 
                ? PostStatus.Published 
                : PostStatus.Blocked;
            
            await post.save();
            return post;
        } catch (error) {
            console.error("Error in SPostBlockUnblock", error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to update post status', 500);
        }
    }
    


}

export default new PostService()