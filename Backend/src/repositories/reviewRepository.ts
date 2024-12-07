import Review, { ReviewDocument } from "../models/reviewModel";
import { BaseRepository } from "./baseRepository";

class ReviewRepository extends BaseRepository<ReviewDocument> {
    constructor() {
        super(Review)
    }

    async getReviewsByVendorId(vendorId: string, page: number, pageSize: number) {
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

export default new ReviewRepository()