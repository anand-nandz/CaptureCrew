import { ReviewDocument } from "../../models/reviewModel";

export interface IReviewService{
    addNewReview(vendorId: string, userId: string, bookingId: string, rating: number, content: string): Promise<ReviewDocument | null>;
    getreviewsForvendor(vendorId: string, page: number, pageSize: number): Promise<{ reviews: ReviewDocument[]; count: number }>;
    checkReviews(bookingId: string, user_id: string):Promise<ReviewDocument | null>;
    updateReviews(reviewId: string, rating: number, content: string): Promise<ReviewDocument | null>;
    singleVendorReviews(vendorId: string, page:number, pageSize: number): Promise<{ reviews: ReviewDocument[]; count: number }> 
}