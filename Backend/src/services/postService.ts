import { CustomError } from "../error/customError"
import { s3Service } from "./s3Service";
import { PostDocument, PostUpdateData } from "../models/postModel";
import mongoose from "mongoose";
import { ImageService } from "./imageService";
import { validatePostInput } from "../validations/postValidation";
import { ObjectId } from 'mongodb';
import { IPostService } from "../interfaces/serviceInterfaces/post.Service.interface";
import { IPostRepository } from "../interfaces/repositoryInterfaces/post.repository.interface";
import { PackageDocument } from "../models/packageModel";
import { Vendor } from "../interfaces/commonInterfaces";
import { IVendorRepository } from "../interfaces/repositoryInterfaces/vendor.Repository.interface";
import { PostStatus, ServiceProvided } from "../enums/commonEnums";
import { IPackageRepository } from "../interfaces/repositoryInterfaces/package.repository.intrface";
import { IReviewRepository } from "../interfaces/repositoryInterfaces/review.Repository.interface";
import { ReviewDocument } from "../models/reviewModel";

class PostService implements IPostService {
    private imageService: ImageService;
    private postRepository: IPostRepository;
    private vendorRepository: IVendorRepository;
    private packageRepository: IPackageRepository;
    private reviewRepository: IReviewRepository;

    constructor(
        postRepository: IPostRepository, 
        vendorRepository: IVendorRepository,
        packageRepository: IPackageRepository,
        reviewRepository: IReviewRepository
    ) {
        this.postRepository = postRepository;
        this.vendorRepository = vendorRepository;
        this.packageRepository = packageRepository;
        this.reviewRepository = reviewRepository
        this.imageService = new ImageService()
    }

    addNewPost = async (
        caption: string,
        location: string,
        serviceType: ServiceProvided,
        status: PostStatus,
        files: Express.Multer.File[],
        vendorId: mongoose.Types.ObjectId
    ): Promise<{ post: PostDocument }> => {
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

            const createdPost = await this.postRepository.create(postData)

            return { post: createdPost };


        } catch (error) {
            console.error('Error while creating new post', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to create new post', 500);
        }
    }

    getVendorPosts = async (
        vendorId: mongoose.Types.ObjectId,
        limit: number,
        page: number
    ): Promise<{
        posts: Partial<PostDocument>[];
        totalPages: number;
        total: number;
        currentPage: number;
    }> => {
        try {
            const result = await this.postRepository.getVendorPosts(vendorId, page, limit);

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


    displayPosts = async (limit: number, page: number): Promise<{
        posts: Partial<PostDocument>[],
        totalPages: number,
        total: number,
        currentPage: number
    }> => {
        try {
            const result = await this.postRepository.getAllPosts(page, limit);

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


    singleVendorPosts = async (
        vendorId: string,
        page: number,
        limit: number
    ): Promise<{
        posts: Partial<PostDocument>[];
        package: PackageDocument[];
        vendor: Vendor;
        reviews: ReviewDocument[];
        totalPages: number;
        total: number;
        currentPage: number;
    }> => {
        try {
            const [result, pkg, vendorDetails, reviews] = await Promise.all([
                this.postRepository.getSingleVendorPost(vendorId, page, limit),
                this.packageRepository.getPkgs(new ObjectId(vendorId)),
                this.vendorRepository.getById(vendorId),
                this.reviewRepository.getReviewsByVendorId(vendorId,1,1)
            ]);
            console.log(reviews,'vendor reviewwww');
            
            if (!vendorDetails) {
                throw new CustomError('Wrong VendorId', 404)
            }

            const processedReviews = Array.isArray(reviews.reviews) && reviews.reviews.length > 0 ? reviews.reviews : [];

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

            if (vendorDetails?.imageUrl) {
                try {
                    const imageUrl = await s3Service.getFile('captureCrew/vendor/photo/', vendorDetails?.imageUrl);
                    processedVendorDetails = {
                        ...vendorDetails.toObject(),
                        imageUrl: imageUrl
                    };
                } catch (error) {
                    console.error('Error generating signed URL:', error);
                }
            }

            return {
                posts: postWithSignedUrls,
                package: pkg,
                vendor: processedVendorDetails,
                reviews: processedReviews,
                totalPages: result.totalPages,
                total: result.total,
                currentPage: result.currentPage
            }

        } catch (error) {
            console.error('Error in getting single VendorId posts:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError("Failed to fetch VendorId Posts", 500)
        }
    }



    displayPostsAdmin = async(
        limit: number,
        page: number,
        search : string
    ): Promise<{
        posts: Array<PostDocument | Record<string, any>>;
        total: number;
        totalPages: number;
        currentPage: number;
    }> =>{
        try {
            const result = await this.postRepository.getAllPostsAd(limit, page, search);            
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
                        } 
                    } catch (error) {
                        console.error('Error processing post:', error);
                        return post as PostDocument;
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



    updatePostService = async (
        postId: string,
        vendorId: string,
        caption?: string,
        location?: string,
        serviceType?: string,
        status?: string,
        files?: Express.Multer.File[],
        existingImages?: string,
        deletedImages?: string
    ): Promise<PostDocument> => {
        try {
            const existingPost = await this.postRepository.getById(postId);

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

            const remainingImages = existingImages
                ? existingImages.split(',').map(url => extractFilename(url))
                : [];

            const imagesToDelete = deletedImages
                ? deletedImages.split(',').map(url => extractFilename(url))
                : [];

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

            const finalImages = [...remainingImages, ...newUploadUrls];

            if (finalImages.length < 4 || finalImages.length > 6) {
                throw new CustomError(
                    `Total images must be between 4 and 6. Current: ${finalImages.length}`,
                    400
                );
            }

            const updateData: PostUpdateData = {
                ...(caption !== undefined && { caption }),
                ...(location !== undefined && { location }),
                ...(serviceType !== undefined && { serviceType: serviceType as ServiceProvided }),
                ...(status !== undefined && { status: status as PostStatus }),
                imageUrl: finalImages,
                updatedAt: new Date()
            };

            const updatedPost = await this.postRepository.findByIdAndUpdate(
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


    SPostBlockUnblock = async(postId: string): Promise<PostDocument> =>{
        try {
            const post = await this.postRepository.getById(postId);

            if (!post) {
                throw new CustomError('Post not Found', 404);
            }

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

export default PostService