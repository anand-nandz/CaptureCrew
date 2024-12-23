import { AdminLoginResponse } from "../commonInterfaces";

export interface IAdminService {
    login(email: string, password: string): Promise<AdminLoginResponse>;
    createRefreshToken(jwtTokenAdmin: string): Promise<string>;
    getDashboardStats(): Promise<{
        totalVendors: { count: number };
        totalUsers: { count: number };
        totalPosts: { count: number };
        revenue: { count: string };
    }>;
    getRevenueDetails(dateType: string, startDate?: string, endDate?: string): Promise<number[]>;
}