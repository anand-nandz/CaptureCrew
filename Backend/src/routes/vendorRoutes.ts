import express from "express";
import vendorController from "../controllers/vendorController";

const router = express.Router() ; 

router.post('/signup',vendorController.VendorSignUp) ;
router.post('/login',vendorController.VendorLogin) ;
router.post('/verify',vendorController.VerifyOTP) ;
router.post('/logout',vendorController.VendorLogout) ;

export default router ;