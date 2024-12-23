import { ReviewDocument } from "../../models/reviewModel";

export interface IReviewRepository{
    create(data: Partial<ReviewDocument>): Promise<ReviewDocument>;
    findByCondition(condition: Record<string, unknown>): Promise<ReviewDocument[]>;
    update(id: string, data: Partial<ReviewDocument>): Promise<ReviewDocument | null>;
    findOne(condition: Record<string, unknown>): Promise<ReviewDocument | null>;
    getReviewsByVendorId(vendorId: string, page: number, pageSize: number): Promise<{ reviews: ReviewDocument[]; count: number }>;
    getById(id: string): Promise<ReviewDocument | null>; 

}