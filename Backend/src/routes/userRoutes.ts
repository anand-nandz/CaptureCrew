import express from "express";
import { authMiddleware } from "../middlewares/userauthMiddleware";
import { authenticateToken} from "../middlewares/authToken";
import multer from "multer";
import UserController from "../controllers/userController";
import UserService from "../services/userService";
import UserRepository from "../repositories/userRepository";
import PostController from "../controllers/postController";
import PostRepository from "../repositories/postRepository";
import PostService from "../services/postService";
import BookingRepository from "../repositories/bookingRepository";
import BookingService from "../services/bookingService";
import BookingController from "../controllers/bookingController";
import BookingRepo from "../repositories/bookingRepo";
import PaymentService from "../services/paymentService";
import VendorRepository from "../repositories/vendorRepository";
import VendorService from "../services/vendorService";
import VendorController from "../controllers/vendorController";
import ReviewRepository from "../repositories/reviewRepository";
import Reviewservice from "../services/reviewService";
import ReviewController from "../controllers/reviewController";
import ReportRepository from "../repositories/reportRepository";
import Reportservice from "../services/reportService";
import ReportController from "../controllers/reportController";
import PackageRepository from "../repositories/packageRepository";

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const userRepository = new UserRepository()
const vendorRepository = new VendorRepository()
const packageRepository =  new PackageRepository()
const bookingRepo = new BookingRepo();
const reviewRepository = new ReviewRepository();
const userService = new UserService(userRepository)
const vendorService = new VendorService(vendorRepository,packageRepository,bookingRepo)
const userController = new UserController(userService,vendorService)
const vendorController =  new VendorController(vendorService)

const postRepository = new PostRepository();
const postService = new PostService(postRepository,vendorRepository,packageRepository, reviewRepository)
const postController = new PostController(postService)

const bookingRepository = new BookingRepository();
const paymentService = new PaymentService()
const bookingService = new BookingService(bookingRepository,bookingRepo,userRepository,paymentService,vendorRepository,packageRepository)
const bookingController = new BookingController(bookingService);

const reviewService = new Reviewservice(reviewRepository,vendorRepository);
const reviewController = new ReviewController(reviewService);

const reportRepository =  new ReportRepository();
const reportService = new Reportservice(reportRepository, vendorRepository, postRepository);
const reportController = new ReportController(reportService);


const router = express.Router() ;

router.post('/login',userController.Login.bind(userController));
router.post('/logout',userController.UserLogout.bind(userController))
router.post('/signup',userController.UserSignUp.bind(userController))
router.post('/verify',userController.VerifyOTP.bind(userController))
router.get('/resendOtp',userController.ResendOtp.bind(userController))

router.post('/refresh-token',userController.create_RefreshToken.bind(userController))
router.get('/check-block-status',authMiddleware,userController.checkBlockStatus.bind(userController))

router.post('/forgot-password',userController.forgotPassword.bind(userController))
router.post('/reset-password/:token',userController.changeForgotPassword.bind(userController))
router.get('/validate-reset-token/:token',userController.validateResetToken.bind(userController))
router.put('/change-password',authenticateToken,userController.changePassword.bind(userController))

router.post('/google/register',userController.googleSignUp.bind(userController))
router.post('/google/login',userController.googleAuth.bind(userController))

router.get('/profile',authenticateToken,userController.getUserProfile.bind(userController))
router.put('/profile', upload.single("image"), authenticateToken, userController.updateProfile.bind(userController))

router.get('/vendors',authenticateToken,userController.getAllVendors.bind(userController));
router.get('/getUser',authenticateToken,userController.getUser.bind(userController));

router.get('/viewposts',authenticateToken,postController.getAllPostsUser.bind(postController))
router.get('/portfolio/:vendorId',authenticateToken,postController.getVendorIdPosts.bind(postController))

router.get('/bookings',authenticateToken,bookingController.fetchBookingRequests.bind(bookingController))
router.post('/bookings/request',authenticateToken,bookingController.BookingRequest.bind(bookingController))
router.patch('/bookings/:bookingId/cancel',bookingController.cancelBooking.bind(bookingController));
router.post('/isBookingAccepted',authenticateToken,bookingController.checkIsBookingAccepted.bind(bookingController));

router.post('/stripe-payment', authenticateToken,bookingController.makePayment.bind(bookingController));
router.get('/confirmPayment',bookingController.verifyPayment.bind(bookingController));

router.post('/stripe-payments', authenticateToken,bookingController.makeMFPayment.bind(bookingController));
router.get('/confirmMFPayment',bookingController.verifyMFPayment.bind(bookingController));

router.post('/cancel-booking',authenticateToken,bookingController.refundCancelAmt.bind(bookingController));
router.get('/bookings/:bookingId',authenticateToken,bookingController.bookingCancel.bind(bookingController))

router.get('/getVendor',authenticateToken,vendorController.getVendor.bind(vendorController));

router.post('/addReview',authenticateToken,reviewController.addReview.bind(reviewController));
router.get('/getReviews/:vendorId',authenticateToken,reviewController.getReviews.bind(reviewController));
router.get('/checkReview/:bookingId',authenticateToken,reviewController.checkReviews.bind(reviewController));
router.post('/updateReview/:reviewId',authenticateToken,reviewController.updateReviews.bind(reviewController));

router.post('/reports',authenticateToken,reportController.reoportItem.bind(reportController))

export default router ;










    




