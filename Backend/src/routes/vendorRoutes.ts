import express from "express";
import vendorController from "../controllers/vendorController";
import { vendorMiddleware } from "../middlewares/vendorauthMiddleware";
import { authenticateTokenVendor } from "../middlewares/vendorauthToken";
import multer from "multer";
import postController from "../controllers/postController";
import bookingController from "../controllers/bookingController";

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


const router = express.Router() ; 

router.post('/signup',vendorController.VendorSignUp) ;
router.post('/login',vendorController.VendorLogin) ;
router.post('/verify-email',vendorController.VerifyOTP) ;
router.post('/logout',vendorController.VendorLogout) ;
router.post('/refresh-token',vendorController.CreateRefreshToken) ;
router.get('/check-block-status',vendorMiddleware,vendorController.checkBlockStatus) ;

router.post('/forgot-password',vendorController.forgotPassword);
router.post('/reset-password/:token',vendorController.changeForgotPassword);
router.get('/validate-reset-token/:token',vendorController.validateResetToken);

router.get('/profile', authenticateTokenVendor, vendorController.getVendorProfile)
router.put('/profile', upload.single("image"), authenticateTokenVendor, vendorController.updateProfile)

router.get('/posts',authenticateTokenVendor,postController.getPosts)
router.post('/add-post', upload.array("images", 6), authenticateTokenVendor, postController.createPost)
router.put('/edit-post/:id', upload.array("images", 6), authenticateTokenVendor, postController.updatePost)

router.get('/view-packages',authenticateTokenVendor,vendorController.getPackages)
router.post('/add-package',authenticateTokenVendor,vendorController.createPackage);
router.put('/edit-package/:id',authenticateTokenVendor,vendorController.updatePackge);

router.get('/vendorDetails',authenticateTokenVendor,vendorController.getVendorWithAll);

router.get('/dateAvailabilty',authenticateTokenVendor,vendorController.showUnavailableDates)
router.post('/dateAvailabilty',authenticateTokenVendor,vendorController.addUnavailableDates)
router.post('/dateAvailabilty/unblock', authenticateTokenVendor, vendorController.removeUnavailableDates);

router.get('/bookings',authenticateTokenVendor,bookingController.SingleVendorBookingReq)
router.patch('/bookings/accept-reject', authenticateTokenVendor,bookingController.acceptBooking);



export default router ;