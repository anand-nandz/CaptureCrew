import express from 'express';
import adminController from '../controllers/adminController';

const router = express.Router();

router.post('/login', adminController.AdminLogin);
router.get('/logout', adminController.AdminLogout);
router.get('/users', adminController.getAllUsers);
router.get('/vendors', adminController.getAllVendors);
router.put('/vendors/:vendorId/status', adminController.VerifyVendor);
router.patch('/block-unblock', adminController.UserBlockUnblock);
router.patch('/vendorblock-unblock', adminController.VendorBlockUnblock);


export default router;
