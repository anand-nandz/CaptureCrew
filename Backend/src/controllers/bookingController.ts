import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/userTypes";
import { handleError } from "../utils/handleError";
import bookingService from "../services/bookingService";
import { VendorRequest } from "../types/vendorTypes";



class BookingController {

    async FetchBookingRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?._id
            if (!userId) {
                res.status(400).json({ message: 'User ID is missing' });
                return;
            }

            const fetchData = await bookingService.getBookingRequests(userId.toString());
            
            if (fetchData.success) {
                res.status(200).json({ success: true, bookingReqs: fetchData.bookingRequest })
            }
        } catch (error) {
            handleError(res, error, 'FetchBookingRequests')
        }
    }



    async BookingRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { vendorId, ...bookingData } = req.body;
            const userId = req.user?._id;

            console.log(bookingData, 'body bookingdata');
            console.log(vendorId, 'vendorid');
            console.log(userId, 'userId');


            if (!userId) {
                res.status(400).json({ message: 'User ID is missing' });
                return;
            }

            const newBooking = await bookingService.newBookingReq(bookingData, vendorId.toString(), userId.toString())
            console.log(newBooking, 'newBooking in controller.............');

            res.status(201).json({ success: true, booking: newBooking });


        } catch (error) {
            handleError(res, error, 'BookingRequest')
        }
    }


    async SingleVendorBookingReq(req: VendorRequest, res: Response): Promise<void> {
        try {
            const vendorId = req.vendor?._id;
            if (!vendorId) {
                res.status(400).json({ message: 'User ID is missing' });
                return;
            }

            const fetchData = await bookingService.bookingReqsVendor(vendorId.toString());
            if (fetchData.success) {
                res.status(200).json({ success: true, bookingReqs: fetchData.bookingRequest })
            }
        } catch (error) {
            handleError(res, error, 'SingleVendorBookingReq')
        }
    }

    async cancelBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { bookingId } = req.params;
            const userId = req.user?._id;
            console.log(bookingId, userId);

            if (!userId) {
                res.status(400).json({ message: 'User ID is missing' });
                return;
            }
            await bookingService.revokeRequest(bookingId, userId.toString());
            res.status(200).json({ message: 'Booking cancelled successfully' });
        } catch (error) {
            handleError(res, error, 'cancelBooking')
        }
    }


    async acceptBooking(req: VendorRequest, res: Response): Promise<void> {
        try {
            const bookingId: string | undefined = req.query.bookingId as string
            const action: string | undefined = req.query.action as string;
            const { rejectionReason } = req.body;
            const vendorId = req.vendor?._id;
            console.log(bookingId, vendorId);
            if (!bookingId) {
                res.status(400).json({ message: 'bookingId is missing or invalid' })
                return
            }
            if (!vendorId) {
                res.status(400).json({ message: 'Vendor ID is missing' });
                return;
            }
            if (!action || !['accept', 'reject'].includes(action)) {
                res.status(400).json({ message: 'Invalid action' });
                return;
            }
            await bookingService.acceptRejectReq(bookingId, vendorId.toString(), action, rejectionReason);
            res.status(200).json({
                success: true,
                message: `Booking ${action}ed successfully`
            });
        } catch (error) {
            handleError(res, error, 'cancelBooking')
        }
    }

 
}

export default new BookingController()