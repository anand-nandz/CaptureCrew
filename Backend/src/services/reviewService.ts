import mongoose from "mongoose"
import { CustomError } from "../error/customError"
import vendorRepository from "../repositories/vendorRepository"
import reviewRepository from "../repositories/reviewRepository"
import { s3Service } from "./s3Service"
import { IVendorRepository } from "../interfaces/repositoryInterfaces/vendor.Repository.interface"
import { IReviewService } from "../interfaces/serviceInterfaces/review.Service.Interface"
import { IReviewRepository } from "../interfaces/repositoryInterfaces/review.Repository.interface"
import { ReviewDocument } from "../models/reviewModel"

class Reviewservice implements IReviewService{

    private vendorRepository: IVendorRepository;
    private reviewRepository: IReviewRepository;
    constructor(
        reviewRepository: IReviewRepository,
        vendorRepository: IVendorRepository
    ) {
        this.reviewRepository = reviewRepository
        this.vendorRepository = vendorRepository
    }

    addNewReview = async(
        vendorId: string,
        userId: string,
        bookingId: string,
        rating: number,
        content: string
    ):  Promise<ReviewDocument | null> =>{
        try {
            const vendor_id = new mongoose.Types.ObjectId(vendorId)
            const user_id = new mongoose.Types.ObjectId(userId)
            const booking_id = new mongoose.Types.ObjectId(bookingId)

            const vendorData = await this.vendorRepository.getById(vendorId)
            
            if (!vendorData) {
                throw new CustomError('Vendor Not found', 404)
            }
            const reviewDatas = await this.reviewRepository.create({
                vendorId: vendor_id,
                userId: user_id,
                bookingId: booking_id,
                rating,
                content
            })
            console.log(reviewDatas);

            const vendorReview = await this.reviewRepository.findByCondition({ vendorId })

            const vendorRatings = vendorReview.map((review) => review.rating);
            vendorData.totalRating = calculateOverallRating(vendorRatings);
            await vendorData.save()
            return reviewDatas;
        } catch (error) {
            console.error('Error in adding new Review:', error)
            throw new CustomError('Failed to add review', 500)
        }
    }

    getreviewsForvendor = async(vendorId: string, page: number, pageSize: number): Promise<{ reviews: ReviewDocument[]; count: number }> =>{
        try {
            const data = await this.reviewRepository.getReviewsByVendorId(vendorId, page, pageSize)

            const processedReviews = await Promise.all(
                data.reviews.map(async (review: any) => {
                    if (review.userId?.imageUrl) {
                        try {
                            const signedImageUrl = await s3Service.getFile('captureCrew/photo/', review.userId.imageUrl);
                            review.userId.imageUrl = signedImageUrl;
                        } catch (error) {
                            console.error(`Failed to generate signed URL for user ${review.userId._id}:`, error);
                        }
                    }
                    return review;
                })
            );
            console.log(processedReviews, 'dataaaaa');


            return {
                reviews: processedReviews,
                count: data.count
            };
        } catch (error) {
            console.error('Error in getting Reviews:', error)
            throw new CustomError('Failed to get all review', 500)
        }
    }

    updateReviews = async(reviewId: string, rating: number, content: string): Promise<ReviewDocument | null>=>{
        try {
            const updatedReviews = await this.reviewRepository.update(
                reviewId,
                {rating:rating,content:content},

            )
            return updatedReviews
        } catch (error) {
            console.error('Error in updateing Reviews:', error)
            throw new CustomError('Failed to edit review', 500)
        }
    }

    checkReviews = async(bookingId: string, user_id: string):Promise<ReviewDocument | null>=>{
        try {
            const review = await this.reviewRepository.findOne({
                bookingId: bookingId,
                userId: user_id
            })
            if(!review){
                throw new CustomError('No reviews added for this booking',400)
            }
            return review || null
        } catch (error) {
            console.error('Error in getting check Reviews:', error)
            throw new CustomError('Failed to get review', 500)
        }
    }

    singleVendorReviews = async(vendorId: string, page:number, pageSize: number): Promise<{ reviews: ReviewDocument[]; count: number }> =>{
        try {
            const singleVendorReviews = await this.reviewRepository.getReviewsByVendorId(vendorId,page,pageSize)
            const processedReviews = await Promise.all(
                singleVendorReviews.reviews.map(async (review: any) => {
                    if (review.userId?.imageUrl) {
                        try {
                            const signedImageUrl = await s3Service.getFile('captureCrew/photo/', review.userId.imageUrl);
                            review.userId.imageUrl = signedImageUrl;
                        } catch (error) {
                            console.error(`Failed to generate signed URL for user ${review.userId._id}:`, error);
                        }
                    }
                    return review;
                })
            );

            return {
                reviews: processedReviews,
                count: singleVendorReviews.count
            }

        } catch (error) {
            console.error('Error in single Vendor Reviews:', error)
            throw new CustomError('Failed to single Vendor Reviews', 500)
        }
    }
}

export default Reviewservice;

function calculateOverallRating(ratings: number[]): number {
    const validRating = ratings.filter(
        (rating) => typeof rating === 'number' && !isNaN(rating)
    )
    if (validRating.length === 0) {
        return 0
    }

    const totalRating = validRating.reduce((acc, rating) => acc + rating, 0);
    const averagerating = totalRating / validRating.length;
    return Math.round(averagerating * 10) / 10;
}