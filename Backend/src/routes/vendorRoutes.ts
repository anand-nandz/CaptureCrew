import express from "express";
import vendorController from "../controllers/vendorController";
import { vendorMiddleware } from "../middlewares/vendorauthMiddleware";
import { authenticateTokenVendor } from "../middlewares/vendorauthToken";

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

router.get('/profile',authenticateTokenVendor,vendorController.getVendor)
router.put('/profile',authenticateTokenVendor,vendorController.updateProfile)

export default router ;