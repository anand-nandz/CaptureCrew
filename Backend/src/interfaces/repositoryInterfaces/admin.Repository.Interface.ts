import { AdminDocument } from "../../models/adminModel";

export interface IAdminRepository {
    findByEmail(email: string): Promise<AdminDocument | null>
    getById(id: string): Promise<AdminDocument | null>;
    getDashboardStats(): Promise<{
        totalVendors: number;
        totalUsers: number;
        totalPosts: number;
        totalRevenue: number;
        trends: { vendors: number; users: number; posts: number };
    }>;
}