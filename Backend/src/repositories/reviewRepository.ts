import { IReviewRepository } from "../interfaces/repositoryInterfaces/review.Repository.interface";
import Review, { ReviewDocument } from "../models/reviewModel";
import { BaseRepository } from "./baseRepository";

class ReviewRepository extends BaseRepository<ReviewDocument> implements IReviewRepository {
    constructor() {
        super(Review)
    }

    getReviewsByVendorId = async(vendorId: string, page: number, pageSize: number): Promise<{ reviews: ReviewDocument[]; count: number }> =>{      
        const skip = (page - 1) * pageSize;
        const reviews = await Review.find({ vendorId: vendorId })
            .populate({
                path: 'vendorId',
                select: '-password -refreshToken', 
            })
            .populate({
                path: 'userId',
                select: '-refreshToken -resetPasswordToken -resetPasswordExpires -transactions', 
            })
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(pageSize)

        const count = await Review.countDocuments({ vendorId: vendorId });
        return { reviews, count };
    }
}

export default ReviewRepository