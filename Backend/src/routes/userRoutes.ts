import express from "express";
import userController from "../controllers/userController";
import { authMiddleware } from "../middlewares/userauthMiddleware";
import { authenticateToken} from "../middlewares/authToken";
import multer from "multer";
import postController from "../controllers/postController";
import bookingController from "../controllers/bookingController";

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = express.Router() ;

router.post('/signup',userController.UserSignUp)
router.post('/verify',userController.VerifyOTP)
router.get('/resendOtp',userController.ResendOtp)
router.post('/login',userController.Login)
router.post('/logout',userController.UserLogout)
router.post('/refresh-token',userController.CreateRefreshToken)
router.get('/check-block-status',authMiddleware,userController.checkBlockStatus)

router.post('/forgot-password',userController.forgotPassword)
router.post('/reset-password/:token',userController.changeForgotPassword)
router.get('/validate-reset-token/:token',userController.validateResetToken)

router.post('/google/register',userController.googleSignUp)
router.post('/google/login',userController.googleAuth)


router.get('/profile',authenticateToken,userController.getUserProfile)
router.put('/profile', upload.single("image"), authenticateToken, userController.updateProfile)
router.put('/change-password',authenticateToken,userController.changePassword)


router.get('/vendors',authenticateToken,userController.getAllVendors);

router.get('/viewposts',authenticateToken,postController.getAllPostsUser)
router.get('/portfolio/:vendorId',authenticateToken,postController.getVendorIdPosts)

router.get('/bookings',authenticateToken,bookingController.FetchBookingRequests)
router.post('/bookings/request',authenticateToken,bookingController.BookingRequest)
router.patch('/bookings/:bookingId/cancel', authenticateToken,bookingController.cancelBooking);
// router.get('/vendors', userController.getAllVendors);
    

export default router ;