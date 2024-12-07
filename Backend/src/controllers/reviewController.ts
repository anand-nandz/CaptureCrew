import { Request, Response } from 'express';
import { handleError } from "../utils/handleError"
import reviewService from '../services/reviewService';
import { error } from 'console';
import { AuthenticatedRequest } from '../types/userTypes';
import { CustomError } from '../error/customError';
import { VendorRequest } from '../types/vendorTypes';

class ReviewController {
    async addReview(req: Request, res: Response): Promise<void> {
        try {
            const { vendorId, userId, bookingId, rating, content } = req.body;
            console.log(req.body, 'reviews');

            const result = await reviewService.addNewReview(
                vendorId,
                userId,
                bookingId,
                rating,
                content
            )
            console.log(result);
            if (!result) {
                res.status(400).json({ error: "Couldn't add reviews" })
            }
            res.status(200).json({ message: 'Review Added for this booking.' })

        } catch (error) {
            handleError(res, error, 'getAllPostsAdmin')
        }
    }

    async getReviews(req: Request, res: Response): Promise<void> {
        try {
            const { vendorId } = req.params;
            const page: number = parseInt(req.query.page as string) || 1;
            const pageSize: number = parseInt(req.query.pageSize as string) || 6;
            const { reviews, count } = await reviewService.getreviewsForvendor(vendorId, page, pageSize);
            const totalPages = Math.ceil(count / pageSize)
            res.status(200).json({ reviews, totalPages })
        } catch (error) {
            handleError(res, error, 'getReviews')
        }
    }

    async updateReviews(req: Request, res: Response): Promise<void> {
        try {
            const { reviewId } = req.params;
            const { rating, content } = req.body;
            const updated = await reviewService.updateReviews(reviewId, rating, content);
            res.status(200).json({ message: 'Review updated successfully', review: updated })
        } catch (error) {
            handleError(res, error, 'updateReviews')
        }
    }
    async checkReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { bookingId } = req.params
            const userId = req.user?._id
            if (!userId) {
                throw new CustomError('User not found', 404)
            }
            const review = await reviewService.checkReviews(bookingId, userId?.toString());
            if (review) {
                res.status(200).json({ review })
                return
            }
            res.status(200).json({ review: null });
        } catch (error) {
            handleError(res, error, 'checkReviews')
        }
    }

    async getVendorReviews(req:VendorRequest, res:Response): Promise<void> {
        try {
            const vendorId = req.vendor?._id
            const page: number = parseInt(req.query.page as string) || 1;
            const pageSize: number = parseInt(req.query.pageSize as string) || 6;
            if (!vendorId) {
                throw new CustomError('Vendor not found', 404)
            }
            console.log(vendorId);
            
            const { reviews, count } =  await reviewService.singleVendorReviews(vendorId.toString(),page,pageSize)
            const totalPages = Math.ceil(count / pageSize)
            res.status(200).json({ reviews, totalPages })
        } catch (error) {
            handleError(res, error, 'getVendorReviews')
        }
    }
}

export default new ReviewController()