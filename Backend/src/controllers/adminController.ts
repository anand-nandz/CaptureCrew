import { Request, Response } from "express";
import dotenv from 'dotenv';
import user from '../models/userModel'
import { handleError } from "../utils/handleError";
import adminService from "../services/adminService";
import userService from "../services/userService";
import vendorService from "../services/vendorService";
import { AcceptanceStatus } from "../models/vendorModel";
import { AuthRequest } from "../types/adminTypes";
import { CustomError } from "../error/customError";
import jwt from 'jsonwebtoken';
import postService from "../services/postService";
import { PostStatus } from "../models/postModel";
import vendorRepository from "../repositories/vendorRepository";
import bookingService from "../services/bookingService";
import reportService from "../services/reportService";

dotenv.config();

class AdminController {
    constructor() {
        this.AdminLogin = this.AdminLogin.bind(this);  // Bind the method to the class context
    }

    async AdminLogin(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ message: 'Email and Password are required!' });
                return
            }

            const { token, refreshToken, adminData, message } = await adminService.login(email, password);

            res.cookie('jwtTokenAdmin', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            res.status(200).json({ refreshToken, token, adminData, message });
        } catch (error) {
            handleError(res, error, 'AdminLogin');
        }
    }


    async AdminLogout(req: AuthRequest, res: Response): Promise<void> {
        try {
            res.clearCookie('jwtTokenAdmin', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
            res.status(200).json({ message: 'Admin logout Successfully...' })
        } catch (error) {
            handleError(res, error, 'AdminLogout');
        }
    }


    async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
        try {

            if (!req.admin?._id) {
                throw new CustomError('AdminId not found in request', 401);
            }

            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 3
            const search = req.query.search as string || '';
            const status = req.query.status as string;

            const result = await userService.getUsers(page, limit, search, status)
            res.status(200).json({
                users: result.users,
                totalPages: result.totalPages,
                currentPage: page,
                totalUsers: result.total
            })

        } catch (error) {
            handleError(res, error, 'getAllUsers')
        }
    }




    async getAllVendors(req: AuthRequest, res: Response): Promise<void> {
        try {
            const adminId = req.admin?._id
            if (!adminId) {
                res.status(400).json({ message: 'Admin ID is missing' });
                return;
            }

            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 6
            const search = req.query.search as string || '';
            const status = req.query.status as string;
            const result = await vendorService.getVendors(page, limit, search, status)

            res.status(200).json({
                vendors: result.vendors,
                totalPages: result.totalPages,
                currentPage: page,
                totalVendors: result.total
            })

        } catch (error) {
            handleError(res, error, 'getAllVendors')
        }
    }


    async UserBlockUnblock(req: Request, res: Response): Promise<void> {
        try {
            const userId: string | undefined = req.query.userId as string | undefined;
            if (!userId) {
                res.status(400).json({ message: 'UserId is missing or invalid' })
                return
            }
            await userService.SUserBlockUnblock(userId)
            let proceesHandle = await user.findOne({ _id: userId })
            res.status(200).json({
                message: 'User block/unblock status updated succesfully.',
                proceesHandle: !proceesHandle?.isActive ? 'block' : 'unblock'
            })
        } catch (error) {
            handleError(res, error, 'UserBlockUnblock')
        }
    }

    async PostBlockUnblock(req: Request, res: Response): Promise<void> {
        try {
            const postId: string | undefined = req.query.postId as string | undefined;

            if (!postId) {
                res.status(400).json({ message: 'PostId is missing or invalid' });
                return;
            }

            const result = await postService.SPostBlockUnblock(postId);

            res.status(200).json({
                message: 'Post status updated successfully',
                processHandle: result.status === PostStatus.Blocked ? 'block' : 'unblock'
            });
        } catch (error) {
            handleError(res, error, 'PostBlockUnblock');
        }
    }

    async VendorBlockUnblock(req: Request, res: Response): Promise<void> {
        try {
            const vendorId: string | undefined = req.query.vendorId as string | undefined;
            if (!vendorId) {
                res.status(400).json({ message: 'VendorId is missing or invalid' })
                return
            }
            console.log(vendorId, 'vendorId to be blocked');

            await vendorService.SVendorBlockUnblock(vendorId)
            let proceesHandle = await vendorRepository.getById(vendorId)
            res.status(200).json({
                message: 'Vendor block/unblock status updated succesfully.',
                proceesHandle: !proceesHandle?.isActive ? 'block' : 'unblock'
            })
        } catch (error) {
            handleError(res, error, 'VendorBlockUnblock')
        }
    }


    async VerifyVendor(req: Request, res: Response): Promise<void> {
        try {
            const { vendorId } = req.params;
            const { status } = req.body as { status: AcceptanceStatus }
            if (!vendorId) {
                res.status(400).json({ message: 'Invalid vendorId' })
                return
            }
            const result = await vendorService.verifyVendor(vendorId, status);

            if (result.success) {
                res.status(200).json({ message: result.message });
            } else {
                res.status(400).json({ message: result.message });
            }
        } catch (error) {
            handleError(res, error, 'VerifyVendor')
        }
    }

    async CreateRefreshToken(req: Request, res: Response): Promise<void> {
        try {

            const jwtTokenAdmin = req.cookies.jwtTokenAdmin;
            console.log(jwtTokenAdmin, 'create Reftreshtoken calll');

            if (!jwtTokenAdmin) {
                throw new CustomError('No refresh token provided', 401);
            }

            try {
                const newAccessToken = await adminService.createRefreshToken(jwtTokenAdmin);
                console.log(newAccessToken, 'newAces token crearted admin');

                res.status(200).json({ token: newAccessToken });
            } catch (error) {
                if (error instanceof jwt.TokenExpiredError) {
                    res.clearCookie('jwtTokenAdmin');
                    throw new CustomError('Refresh token expired', 401);
                }
                throw error;
            }

        } catch (error) {
            handleError(res, error, 'CreateRefreshToken')
        }
    }


    async getAllBookings(req: AuthRequest, res: Response): Promise<void> {
        try {
            const adminId = req.admin?._id;
            if (!adminId) {
                res.status(400).json({ message: 'Admin ID is missing' });
                return;
            }

            const fetchData = await bookingService.fetchAllBookings();
            // console.log(fetchData,'data in admin');

            if (fetchData.success) {
                res.status(200).json({
                    success: true,
                    bookingReqs: fetchData.bookingRequest,
                    totalCount: fetchData.totalCount
                })
            } else {
                res.status(400).json({
                    success: false,
                    message: fetchData.message || 'No bookings found',
                    bookingReqs: []
                });

            }
        } catch (error) {
            handleError(res, error, 'getAllBookings')

        }
    }

    async getAllInOneDashboardStats(req: Request, res: Response) {
        try {
            const dashboardStats = await adminService.getDashboardStats();

            res.status(200).json({
                success: true,
                message: 'Dashboard statistics retrieved successfully',
                data: dashboardStats
            });
        } catch (error) {
            console.error('Dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve dashboard statistics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getRevenue(req: Request, res: Response){
        try {
            const dateType =  req.query.date as string
            console.log(dateType,'datatype');
            
            const response = await adminService.getRevenueDetails(dateType)
            console.log(response,'in revenue fetching');
            
            if(response){
                res.status(200).json({revenue: response})
            }
        } catch (error) {
            handleError(res, error, 'getRevenue')
        }
    }

    async getReports(req: AuthRequest, res: Response){
        try {
            const adminId = req.admin?._id
            if (!adminId) {
                res.status(400).json({ message: 'Admin ID is missing' });
                return;
            }

            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 6
            const search = req.query.search as string || '';
            const status = req.query.status as string;
            const result = await reportService.getClientReports(page, limit, search, status);
            res.status(200).json({
                reports: result.reports,
                totalPages: result.totalPages,
                currentPage: page,
                totalReports: result.total
            })
        } catch (error) {
            handleError(res, error, 'getReports')
        }
    }

}

export default new AdminController();




