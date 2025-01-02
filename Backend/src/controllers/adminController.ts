import { Request, Response } from "express";
import dotenv from 'dotenv';
import { handleError } from "../utils/handleError";
import { AuthRequest } from "../types/adminTypes";
import { IAdminService } from "../interfaces/serviceInterfaces/admin.Service.Interface";
import { CustomError } from "../error/customError";
import { IUserService } from "../interfaces/serviceInterfaces/user.Service.Interface";
import { IVendorService } from "../interfaces/serviceInterfaces/vendor.service.interface";
import { AcceptanceStatus, BlockStatus, PostStatus } from "../enums/commonEnums";
import jwt from 'jsonwebtoken';
import { IBookingService } from "../interfaces/serviceInterfaces/booking.Service.interface";
import { IReportService } from "../interfaces/serviceInterfaces/report.Service.Interface";
import { IPostService } from "../interfaces/serviceInterfaces/post.Service.interface";
import HTTP_statusCode from "../enums/httpStatusCode";
import { DateRangeQuery } from "../utils/extraUtils";
import Messages from "../enums/errorMessage";


dotenv.config();

class AdminController {

    private adminService: IAdminService;
    private userService: IUserService;
    private vendorService: IVendorService;
    private bookingService: IBookingService;
    private reportService: IReportService;
    private postService: IPostService;

    constructor(
        adminService: IAdminService,
        userService: IUserService,
        vendorService: IVendorService,
        bookingService: IBookingService,
        reportService: IReportService,
        postService: IPostService
    ) {
        this.adminService = adminService;
        this.userService = userService;
        this.vendorService = vendorService;
        this.bookingService = bookingService;
        this.reportService = reportService;
        this.postService = postService
    }

    adminLogin = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'Email and Password are required!' });
                return
            }

            const { token, refreshToken, adminData, message } = await this.adminService.login(email, password);

            res.cookie('jwtTokenAdmin', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            res.status(HTTP_statusCode.OK).json({ refreshToken, token, adminData, message });
        } catch (error) {
            handleError(res, error, 'AdminLogin');
        }
    }


    adminLogout = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            res.clearCookie('jwtTokenAdmin', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
            res.status(HTTP_statusCode.OK).json({ message: 'Admin logout Successfully...' })
        } catch (error) {
            handleError(res, error, 'AdminLogout');
        }
    }


    getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
        try {

            if (!req.admin?._id) {
                throw new CustomError(Messages.ADMIN_ID_MISSING, HTTP_statusCode.Unauthorized);
            }

            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 3
            const search = req.query.search as string || '';
            const status = req.query.status as string;

            const result = await this.userService.getUsers(page, limit, search, status)
            res.status(HTTP_statusCode.OK).json({
                users: result.users,
                totalPages: result.totalPages,
                currentPage: page,
                totalUsers: result.total
            })

        } catch (error) {
            handleError(res, error, 'getAllUsers')
        }
    }

    getAllVendors = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const adminId = req.admin?._id
            if (!adminId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.ADMIN_ID_MISSING});
                return;
            }

            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 6
            const search = req.query.search as string || '';
            const status = req.query.status as string;
            const result = await this.vendorService.getVendors(page, limit, search, status)

            res.status(HTTP_statusCode.OK).json({
                vendors: result.vendors,
                totalPages: result.totalPages,
                currentPage: page,
                totalVendors: result.total
            })

        } catch (error) {
            handleError(res, error, 'getAllVendors')
        }
    }

    UserBlockUnblock = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId: string | undefined = req.query.userId as string | undefined;
            if (!userId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.USER_ID_MISSING })
                return
            }
            const updatedStatus = await this.userService.SUserBlockUnblock(userId)
            res.status(HTTP_statusCode.OK).json({
                message: Messages.UPDATE_USER_STATUS,
                proceesHandle: updatedStatus
            })
        } catch (error) {
            handleError(res, error, 'UserBlockUnblock')
        }
    }

    PostBlockUnblock = async (req: Request, res: Response): Promise<void> => {
        try {
            const postId: string | undefined = req.query.postId as string | undefined;

            if (!postId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.POST_ID_MISSING});
                return;
            }

            const result = await this.postService.SPostBlockUnblock(postId);

            res.status(HTTP_statusCode.OK).json({
                message: Messages.UPDATE_POST_STATUS,
                processHandle: result.status === PostStatus.Blocked ? BlockStatus.BLOCK : BlockStatus.UNBLOCK
            });
        } catch (error) {
            handleError(res, error, 'PostBlockUnblock');
        }
    }

    VendorBlockUnblock = async (req: Request, res: Response): Promise<void> => {
        try {
            const vendorId: string | undefined = req.query.vendorId as string | undefined;
            if (!vendorId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.VENDOR_ID_MISSING })
                return
            }

            const updatedStatus = await this.vendorService.SVendorBlockUnblock(vendorId)
            res.status(HTTP_statusCode.OK).json({
                message: 'Vendor block/unblock status updated succesfully.',
                proceesHandle: updatedStatus
            })
        } catch (error) {
            handleError(res, error, 'VendorBlockUnblock')
        }
    }

    VerifyVendor = async (req: Request, res: Response): Promise<void> => {
        try {
            const { vendorId } = req.params;
            const { status } = req.body as { status: AcceptanceStatus }
            if (!vendorId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'Invalid vendorId' })
                return
            }
            const result = await this.vendorService.verifyVendor(vendorId, status);

            if (result.success) {
                res.status(HTTP_statusCode.OK).json({ message: result.message });
            } else {
                res.status(HTTP_statusCode.BadRequest).json({ message: result.message });
            }
        } catch (error) {
            handleError(res, error, 'VerifyVendor')
        }
    }

    createRefreshToken = async (req: Request, res: Response): Promise<void> => {
        try {

            const jwtTokenAdmin = req.cookies.jwtTokenAdmin;

            if (!jwtTokenAdmin) {
                throw new CustomError(Messages.NO_REFRESHTOKEN, HTTP_statusCode.Unauthorized);
            }

            try {
                const newAccessToken = await this.adminService.createRefreshToken(jwtTokenAdmin);
                res.status(HTTP_statusCode.OK).json({ token: newAccessToken });
            } catch (error) {
                if (error instanceof jwt.TokenExpiredError) {
                    res.clearCookie('jwtTokenAdmin');
                    throw new CustomError(Messages.REFRESHTOKEN_EXP, HTTP_statusCode.Unauthorized);
                }
                throw error;
            }

        } catch (error) {
            handleError(res, error, 'CreateRefreshToken')
        }
    }

    getAllBookings = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const adminId = req.admin?._id;
            const search = req.query.search as string || '';
            if (!adminId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.ADMIN_ID_MISSING});
                return;
            }

            const fetchData = await this.bookingService.fetchAllBookings(search);
            if (fetchData.success) {
                res.status(HTTP_statusCode.OK).json({
                    success: true,
                    bookingReqs: fetchData.bookingRequest,
                    totalCount: fetchData.totalCount
                })
            } else {
                res.status(HTTP_statusCode.BadRequest).json({
                    success: false,
                    message: fetchData.message || 'No bookings found',
                    bookingReqs: []
                });

            }
        } catch (error) {
            handleError(res, error, 'getAllBookings')

        }
    }

    getAllInOneDashboardStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const dashboardStats = await this.adminService.getDashboardStats();

            res.status(HTTP_statusCode.OK).json({
                success: true,
                message: Messages.DASHBOARD_DETAILS,
                data: dashboardStats
            });
        } catch (error) {
            console.error('Dashboard stats error:', error);
            res.status(HTTP_statusCode.InternalServerError).json({
                success: false,
                message: 'Failed to retrieve dashboard statistics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    getRevenue = async (req: Request, res: Response): Promise<void> => {
        try {
            const { date, startDate, endDate } = req.query as unknown as DateRangeQuery;

            const response = await this.adminService.getRevenueDetails(date, startDate, endDate)
            if (response) {
                res.status(HTTP_statusCode.OK).json({ revenue: response })
            }
        } catch (error) {
            handleError(res, error, 'getRevenue')
        }
    }

    getReports = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const adminId = req.admin?._id;
            if (!adminId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.ADMIN_ID_MISSING});
                return;
            }

            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 6
            const search = req.query.search as string || '';
            const status = req.query.status as string;
            const result = await this.reportService.getClientReports(page, limit, search, status);
            res.status(HTTP_statusCode.OK).json({
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

export default AdminController;




