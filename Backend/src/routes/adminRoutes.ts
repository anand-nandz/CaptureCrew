import express from 'express';
import { authTokenAdmin } from '../middlewares/authMiddlewareAdmin';
import AdminRepository from '../repositories/adminRepository';
import AdminService from '../services/adminService';
import AdminController from '../controllers/adminController';
import UserRepository from '../repositories/userRepository';
import UserService from '../services/userService';
import VendorRepository from '../repositories/vendorRepository';
import VendorService from '../services/vendorService';
import PackageRepository from '../repositories/packageRepository';
import BookingRepo from '../repositories/bookingRepo';
import BookingService from '../services/bookingService';
import BookingRepository from '../repositories/bookingRepository';
import PaymentService from '../services/paymentService';
import ReportRepository from '../repositories/reportRepository';
import Reportservice from '../services/reportService';
import PostRepository from '../repositories/postRepository';
import PostService from '../services/postService';
import PostController from '../controllers/postController';
import ReviewRepository from '../repositories/reviewRepository';

const  router = express.Router();

const adminRepository = new AdminRepository();
const userRepository = new UserRepository();
const vendorRepository = new VendorRepository();
const packageRepository = new PackageRepository();
const bookingRepo = new BookingRepo();
const bookingRepository = new BookingRepository();
const postRepository = new PostRepository();
const reportRepository =  new ReportRepository();
const reviewRepository = new ReviewRepository();
const reportService = new Reportservice(reportRepository, vendorRepository, postRepository);

const adminService = new AdminService(adminRepository, bookingRepo);
const userService = new UserService(userRepository);
const vendorService = new VendorService(vendorRepository, packageRepository, bookingRepo);
const paymentService = new PaymentService()
const postService = new PostService(postRepository,vendorRepository,packageRepository, reviewRepository)

const bookingService = new BookingService(bookingRepository,bookingRepo,userRepository,paymentService,vendorRepository,packageRepository)
const adminController = new AdminController(adminService, userService, vendorService, bookingService, reportService, postService)
const postController = new PostController(postService)


router.post('/login', adminController.adminLogin.bind(adminController));
router.get('/logout', adminController.adminLogout.bind(adminController));

router.get('/users',authTokenAdmin, adminController.getAllUsers.bind(adminController));
router.get('/vendors',authTokenAdmin,adminController.getAllVendors.bind(adminController));
router.put('/vendors/:vendorId/status', authTokenAdmin, adminController.VerifyVendor.bind(adminController));
router.patch('/block-unblock',authTokenAdmin, adminController.UserBlockUnblock.bind(adminController));
router.patch('/blockp-unblockp', authTokenAdmin, adminController.PostBlockUnblock.bind(adminController));
router.post('/refresh-token',adminController.createRefreshToken.bind(adminController))
router.patch('/vendorblock-unblock',authTokenAdmin, adminController.VendorBlockUnblock.bind(adminController));

router.get('/view-all-posts', authTokenAdmin,postController.getAllPostsAdmin.bind(postController));
router.get('/all-bookingsReqs',authTokenAdmin,adminController.getAllBookings.bind(adminController));
router.get('/dashboard',authTokenAdmin, adminController.getAllInOneDashboardStats.bind(adminController));
router.get('/revenue',authTokenAdmin, adminController.getRevenue.bind(adminController));
router.get('/client-reports', authTokenAdmin, adminController.getReports.bind(adminController));



export default router;
