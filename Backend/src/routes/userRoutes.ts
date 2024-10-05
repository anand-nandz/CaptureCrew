import express from "express";
import userController from "../controllers/userController";


const router = express.Router() ;

router.post('/signup',userController.UserSignUp)
router.post('/verify',userController.VerifyOTP)
router.post('/login',userController.Login)
router.get('/logout',userController.UserLogout)
router.post('/google/register',userController.googleSignUp)
router.post('/google/login',userController.googleAuth)

export default router ;