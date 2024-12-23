import { Request, Response } from 'express';
import { handleError } from "../utils/handleError"
import reviewService from '../services/reviewService';
import { error } from 'console';
import { AuthenticatedRequest } from '../types/userTypes';
import { CustomError } from '../error/customError';
import { VendorRequest } from '../types/vendorTypes';
import { IReviewService } from '../interfaces/serviceInterfaces/review.Service.Interface';
import HTTP_statusCode from '../enums/httpStatusCode';

class ReviewController {
    private reviewService: IReviewService;
    constructor(reviewService: IReviewService){
        this.reviewService = reviewService
    }

    addReview = async(req: Request, res: Response): Promise<void> =>{
        try {
            const { vendorId, userId, bookingId, rating, content } = req.body;
            
            const result = await this.reviewService.addNewReview(
                vendorId,
                userId,
                bookingId,
                rating,
                content
            )
            console.log(result,'reviewadded');
            
            if (!result) {
                res.status(HTTP_statusCode.BadRequest).json({ error: "Couldn't add reviews" })
            }
            res.status(HTTP_statusCode.OK).json({ message: 'Review Added for this booking.',review: result  })

        } catch (error) {
            handleError(res, error, 'getAllPostsAdmin')
        }
    }

    getReviews = async(req: Request, res: Response): Promise<void> =>{
        try {
            const { vendorId } = req.params;
            const page: number = parseInt(req.query.page as string) || 1;
            const pageSize: number = parseInt(req.query.pageSize as string) || 6;
            const { reviews, count } = await this.reviewService.getreviewsForvendor(vendorId, page, pageSize);
            const totalPages = Math.ceil(count / pageSize)
            res.status(HTTP_statusCode.OK).json({ reviews, totalPages })
        } catch (error) {
            handleError(res, error, 'getReviews')
        }
    }

    updateReviews = async(req: Request, res: Response): Promise<void> =>{
        try {
            const { reviewId } = req.params;
            const { rating, content } = req.body;
            const updated = await this.reviewService.updateReviews(reviewId, rating, content);
            res.status(HTTP_statusCode.OK).json({ message: 'Review updated successfully', review: updated })
        } catch (error) {
            handleError(res, error, 'updateReviews')
        }
    }

    checkReviews = async(req: AuthenticatedRequest, res: Response): Promise<void> =>{
        try {
            const { bookingId } = req.params
            const userId = req.user?._id
            if (!userId) {
                throw new CustomError('User not found', 404)
            }
            const review = await this.reviewService.checkReviews(bookingId, userId?.toString());
            if (review) {
                res.status(HTTP_statusCode.OK).json({ review })
                return
            }
            res.status(HTTP_statusCode.OK).json({ review: null });
        } catch (error) {
            handleError(res, error, 'checkReviews')
        }
    }

    getVendorReviews = async(req:VendorRequest, res:Response): Promise<void> =>{
        try {
            const vendorId = req.vendor?._id
            const page: number = parseInt(req.query.page as string) || 1;
            const pageSize: number = parseInt(req.query.pageSize as string) || 6;
            if (!vendorId) {
                throw new CustomError('Vendor not found', 404)
            }
            
            const { reviews, count } =  await this.reviewService.singleVendorReviews(vendorId.toString(),page,pageSize)
            const totalPages = Math.ceil(count / pageSize)
            res.status(HTTP_statusCode.OK).json({ reviews, totalPages })
        } catch (error) {
            handleError(res, error, 'getVendorReviews')
        }
    }
}

export default ReviewController