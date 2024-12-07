import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/userTypes";
import { handleError } from "../utils/handleError";
import bookingService from "../services/bookingService";
import { VendorRequest } from "../types/vendorTypes";
import bookingRequestModel from "../models/bookingRequestModel";


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
                res.status(200).json({
                    success: true,
                    bookingReqs: fetchData.bookingRequest,
                    bookingConfirmed: fetchData.bookingConfirmed
                })
            }
        } catch (error) {
            handleError(res, error, 'FetchBookingRequests')
        }
    }

    async BookingRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { vendorId, ...bookingData } = req.body;
            const userId = req.user?._id;


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
                res.status(200).json({ success: true, bookingReqs: fetchData.bookingRequest, bookingConfirmed: fetchData.bookingConfirmed })
            }
        } catch (error) {
            handleError(res, error, 'SingleVendorBookingReq')
        }
    }

    async cancelBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { bookingId } = req.params;
            const userId = req.user?._id;

            if (!userId) {
                res.status(401).json({ message: 'User ID is missing' });
                return;
            }
            const result = await bookingService.revokeRequest(bookingId, userId.toString());

            if (result) {
                res.status(200).json({ message: 'Booking cancelled successfully' });
            } else {
                res.status(400).json({ message: 'Unable to cancel booking' });
            }
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

    async checkIsBookingAccepted(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?._id;
            const { vendorId, bookingId } = req.body;
            if (!userId) {
                res.status(400).json({ message: 'User ID is missing' });
                return;
            }

            const result = await bookingService.isBookingAccepted(userId.toString(), vendorId, bookingId);
            if (result !== null) {
                res.status(200).json({ success: true, result: result })
            } else {
                res.json({ success: false })
            }
        } catch (error) {
            handleError(res, error, 'checkIsBookingAccepted')
        }
    }

    async makePayment(req: Request, res: Response): Promise<void> {
        try {

            const { companyName, bookingData, paymentMethod } = req.body;
            let advanceAmount = bookingData.advancePayment.amount;

            if (paymentMethod === 'stripe') {
                const result = await bookingService.makeBookingPayment(companyName, advanceAmount, bookingData)

                if (result) {
                    res.cookie('bookingId', bookingData?._id, { httpOnly: true, secure: process.env.NODE_ENV === 'production', })
                    res.cookie('amount', bookingData?.advancePayment?.amount, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })
                    res.cookie('paymentId', result.id, { httpOnly: true, secure: process.env.NODE_ENV === 'production', });
                    res.status(200).json({ success: true, result, bookingData })
                } else {
                    res.redirect(`${process.env.FRONTEND_URL}/paymentFailed`)
                }
            }
        } catch (error) {
            handleError(res, error, 'makePayment')
        }
    }

    async verifyPayment(req: Request, res: Response): Promise<void> {
        try {

            const bookingId = req.cookies.bookingId;
            const amountPaid = req.cookies.amount;
            const paymentId = req.cookies.paymentId;

            if (!bookingId || !amountPaid || !paymentId) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required payment information'
                });
                return;
            }
            const confirmedBooking = await bookingService.confirmPayment(bookingId, amountPaid, paymentId);
            console.log(confirmedBooking, 'confirmed booking details after adding to booking model');

            if (confirmedBooking) {
                res.clearCookie('bookingId');
                res.clearCookie('amount');
                res.clearCookie('paymentId');
                res.redirect(`${process.env.FRONTEND_URL}/paymentSuccess`)
            } else {
                res.redirect(`${process.env.FRONTEND_URL}/paymentFailed`)
                res.status(400).json({
                    success: false,
                    message: 'Failed to confirm payment'
                });
            }
        } catch (error) {
            handleError(res, error, 'verifyPayment')
        }
    }

    async makeMFPayment(req: Request, res: Response): Promise<void> {
        try {

            const paymentData = req.body;
            
            if (paymentData.paymentMethod === 'stripe') {
                const result = await bookingService.makeMFPayments(paymentData)

                if (result) {
                    res.cookie('bookingcId', paymentData?.bookingId, { httpOnly: true, secure: process.env.NODE_ENV === 'production', })
                    res.cookie('finalAmount', paymentData.sbooking.finalPayment.amount, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })
                    res.cookie('paymentcId', result.id, { httpOnly: true, secure: process.env.NODE_ENV === 'production', });
                    res.status(200).json({ success: true, result, paymentData })
                }
            }
        } catch (error) {
            handleError(res, error, 'makeMFPayment')
        }
    }

    async verifyMFPayment(req: Request, res: Response): Promise<void> {
        try {
            const { finalAmount, bookingcId, paymentcId } = req.cookies;
            let paymentType = '';
            let amountPaid = 0;
            if (finalAmount) {
                paymentType = 'finalAmount';
                amountPaid = finalAmount;
            }

            if (!bookingcId || !amountPaid || !paymentcId) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required payment information'
                });
                return;
            }
            const confirmedBooking = await bookingService.confirmMFPayment(bookingcId, amountPaid, paymentcId, paymentType);

            if (confirmedBooking.success) {
                res.clearCookie('bookingcId');
                res.clearCookie(`${paymentType}`);
                res.clearCookie('paymentcId');
                res.redirect(`${process.env.FRONTEND_URL}/paymentSuccess`)
            } else {
                res.redirect(`${process.env.FRONTEND_URL}/paymentFailed`)
                res.status(400).json({
                    success: false,
                    message: 'Failed to confirm payment'
                });
            }
        } catch (error) {
            handleError(res, error, 'verifyPayment')
        }
    }

    async bookingCancel(req: AuthenticatedRequest, res: Response) {
        try {
            const { bookingId } = req.params;
            const userId = req.user?._id;

            if (!userId) {
                res.status(404).json({ message: 'User ID is missing' });
                return;
            }
            const result = await bookingRequestModel.findOne({
                _id: bookingId,
                user_id: userId
            })

            res.status(200).json({
                success: true,
                result
            });

        } catch (error) {
            handleError(res, error, 'bookingCancel')
        }
    }

    async refundCancelAmt(req: AuthenticatedRequest, res:Response){
        try {    
            const {bookingId, cancellationReason } =req.body;
            console.log(cancellationReason);
            
            if (!bookingId) {
                throw new Error('Booking ID is required.');
            }
            const result = await bookingService.cancelBooking(bookingId,cancellationReason)
            res.status(200).json({ 
                success: true,
                message: 'Booking cancelled successfully'
            });
        } catch (error) {
            handleError(res, error, 'refundCancelAmt')
        }
    }



}

export default new BookingController()