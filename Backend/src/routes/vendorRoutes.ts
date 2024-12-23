import express from "express";
import { vendorMiddleware } from "../middlewares/vendorauthMiddleware";
import { authenticateTokenVendor } from "../middlewares/vendorauthToken";
import multer from "multer";
import VendorRepository from "../repositories/vendorRepository";
import VendorService from "../services/vendorService";
import VendorController from "../controllers/vendorController";
import PostController from "../controllers/postController";
import PostRepository from "../repositories/postRepository";
import PostService from "../services/postService";
import PackageRepository from "../repositories/packageRepository";
import BookingRepository from "../repositories/bookingRepository";
import BookingRepo from "../repositories/bookingRepo";
import BookingService from "../services/bookingService";
import BookingController from "../controllers/bookingController";
import UserRepository from "../repositories/userRepository";
import PaymentService from "../services/paymentService";
import ReviewRepository from "../repositories/reviewRepository";
import Reviewservice from "../services/reviewService";
import ReviewController from "../controllers/reviewController";
import UserService from "../services/userService";
import UserController from "../controllers/userController";

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


const router = express.Router() ;
const userRepository = new UserRepository()
const packageRepository = new PackageRepository()
const bookingRepo = new BookingRepo();
const userService = new UserService(userRepository)
const vendorRepository = new VendorRepository();
const reviewRepository = new ReviewRepository();
const vendorService = new VendorService(vendorRepository,packageRepository,bookingRepo);
const vendorController =  new VendorController(vendorService);
const userController = new UserController(userService,vendorService)

const postRepository = new PostRepository();
const postService = new PostService(postRepository,vendorRepository,packageRepository,reviewRepository);
const postController = new PostController(postService);

const bookingRepository = new BookingRepository();
const paymentService = new PaymentService()
const bookingService = new BookingService(bookingRepository,bookingRepo,userRepository,paymentService,vendorRepository,packageRepository)
const bookingController = new BookingController(bookingService);

const reviewService = new Reviewservice(reviewRepository,vendorRepository);
const reviewController = new ReviewController(reviewService);



router.post('/signup',vendorController.VendorSignUp.bind(vendorController)) ;
router.post('/login',vendorController.VendorLogin.bind(vendorController)) ;
router.post('/verify-email',vendorController.verifyOTP.bind(vendorController)) ;
router.post('/logout',vendorController.VendorLogout.bind(vendorController)) ;
router.post('/refresh-token',vendorController.CreateRefreshToken.bind(vendorController)) ;
router.get('/check-block-status',vendorMiddleware,vendorController.checkBlockStatus.bind(vendorController)) ;

router.post('/forgot-password',vendorController.forgotPassword.bind(vendorController));
router.post('/reset-password/:token',vendorController.changeForgotPassword.bind(vendorController));
router.get('/validate-reset-token/:token',vendorController.validateResetToken.bind(vendorController));
router.put('/change-password',authenticateTokenVendor,vendorController.changePassword.bind(vendorController))

router.get('/profile', authenticateTokenVendor, vendorController.getVendorProfile.bind(vendorController))
router.put('/profile', upload.single("image"), authenticateTokenVendor, vendorController.updateProfile.bind(vendorController))

router.get('/posts',authenticateTokenVendor,postController.getPosts.bind(postController))
router.post('/add-post', upload.array("images", 6), authenticateTokenVendor, postController.createPost.bind(postController))
router.put('/edit-post/:id', upload.array("images", 6), authenticateTokenVendor, postController.updatePost.bind(postController))

router.get('/view-packages',authenticateTokenVendor,vendorController.getPackages.bind(vendorController));
router.post('/add-package',authenticateTokenVendor,vendorController.createPackage.bind(vendorController));
router.put('/edit-package/:id',authenticateTokenVendor,vendorController.updatePackge.bind(vendorController));

router.get('/vendorDetails',authenticateTokenVendor,vendorController.getVendorWithAll.bind(vendorController));

router.get('/dateAvailabilty',authenticateTokenVendor,vendorController.showUnavailableDates.bind(vendorController));
router.post('/dateAvailabilty',authenticateTokenVendor,vendorController.addUnavailableDates.bind(vendorController));
router.post('/dateAvailabilty/unblock', authenticateTokenVendor, vendorController.removeUnavailableDates.bind(vendorController));

router.get('/bookings', authenticateTokenVendor,bookingController.SingleVendorBookingReq.bind(bookingController));
router.patch('/bookings/accept-reject', authenticateTokenVendor,bookingController.acceptBooking.bind(bookingController));

router.get('/getUser',authenticateTokenVendor,userController.getUsers.bind(userController));
router.get('/clientreviews',authenticateTokenVendor,reviewController.getVendorReviews.bind(reviewController));
router.get('/revenue',authenticateTokenVendor, vendorController.getRevenue.bind(vendorController));



export default router ;