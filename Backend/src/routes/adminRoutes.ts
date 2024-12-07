import express from 'express';
import adminController from '../controllers/adminController';
import postController from '../controllers/postController';
import { authTokenAdmin } from '../middlewares/authMiddlewareAdmin';
import bookingController from '../controllers/bookingController';

const  router = express.Router();

router.post('/login', adminController.AdminLogin);
router.get('/logout', adminController.AdminLogout);
router.get('/users',authTokenAdmin, adminController.getAllUsers);
router.get('/vendors',authTokenAdmin,adminController.getAllVendors);
router.put('/vendors/:vendorId/status', authTokenAdmin, adminController.VerifyVendor);
router.patch('/block-unblock',authTokenAdmin, adminController.UserBlockUnblock);
router.patch('/blockp-unblockp', authTokenAdmin, adminController.PostBlockUnblock);
router.post('/refresh-token',adminController.CreateRefreshToken)
router.patch('/vendorblock-unblock',authTokenAdmin, adminController.VendorBlockUnblock);

router.get('/view-all-posts',authTokenAdmin,postController.getAllPostsAdmin);
router.get('/all-bookingsReqs',authTokenAdmin,adminController.getAllBookings);
router.get('/dashboard',authTokenAdmin, adminController.getAllInOneDashboardStats);
router.get('/revenue',authTokenAdmin, adminController.getRevenue);
router.get('/client-reports',authTokenAdmin, adminController.getReports);



export default router;
