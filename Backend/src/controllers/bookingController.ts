import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/userTypes";
import { handleError } from "../utils/handleError";
import bookingService from "../services/bookingService";
import { VendorRequest } from "../types/vendorTypes";
import bookingRequestModel from "../models/bookingRequestModel";
import { IBookingService } from "../interfaces/serviceInterfaces/booking.Service.interface";
import HTTP_statusCode from "../enums/httpStatusCode";
import Messages from "../enums/errorMessage";


class BookingController  {
     
    private bookingService: IBookingService;
    constructor (bookingService: IBookingService){
        this.bookingService = bookingService
    }

    fetchBookingRequests = async(req: AuthenticatedRequest, res: Response): Promise<void> =>{
        try {
            const userId = req.user?._id
            if (!userId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.USER_ID_MISSING });
                return;
            }

            const fetchData = await this.bookingService.getBookingRequests(userId.toString());

            if (fetchData.success === true) {
                res.status(HTTP_statusCode.OK).json({
                    success: true,
                    bookingReqs: fetchData.bookingRequest,
                    bookingConfirmed: fetchData.bookingConfirmed
                })
            } else {
                res.status(HTTP_statusCode.OK).json({
                    success: false,
                    bookingReqs: [],
                    bookingConfirmed: []
                })
            }
        } catch (error) {
            handleError(res, error, 'FetchBookingRequests')
        }
    }

    BookingRequest = async(req: AuthenticatedRequest, res: Response): Promise<void> =>{
        try {
            const { vendorId, ...bookingData } = req.body;
            const userId = req.user?._id;

            if (!userId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.USER_ID_MISSING});
                return;
            }

            const newBooking = await this.bookingService.newBookingReq(bookingData, vendorId.toString(), userId.toString())

            res.status(201).json({ success: true, booking: newBooking });


        } catch (error) {
            handleError(res, error, 'BookingRequest')
        }
    }

    SingleVendorBookingReq = async(req: VendorRequest, res: Response): Promise<void> =>{
        try {
            const vendorId = req.vendor?._id;
            if (!vendorId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.USER_ID_MISSING });
                return;
            }

            const fetchData = await this.bookingService.bookingReqsVendor(vendorId.toString());
            
            if (fetchData.success === true) {
                res.status(HTTP_statusCode.OK).json({ success: true, bookingReqs: fetchData.bookingRequest, bookingConfirmed: fetchData.bookingConfirmed })
            } else {
                res.status(HTTP_statusCode.OK).json({ success: false, bookingReqs: [], bookingConfirmed: [] })

            }
        } catch (error) {
            handleError(res, error, 'SingleVendorBookingReq')
        }
    }

    cancelBooking = async(req: AuthenticatedRequest, res: Response): Promise<void> =>{
        try {
            const { bookingId } = req.params;
            const userId = req.user?._id;

            if (!userId) {
                res.status(401).json({ message: Messages.USER_ID_MISSING });
                return;
            }
            const result = await this.bookingService.revokeRequest(bookingId, userId.toString());
            
            if (result) {
                res.status(HTTP_statusCode.OK).json({ message: Messages.BOOKING_CANCELLED });
            } else {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'Unable to cancel booking' });
            }
        } catch (error) {
            handleError(res, error, 'cancelBooking')
        }
    }

    acceptBooking = async(req: VendorRequest, res: Response): Promise<void> =>{
        try {
            const bookingId: string | undefined = req.query.bookingId as string
            const action: string | undefined = req.query.action as string;
            const { rejectionReason } = req.body;
            const vendorId = req.vendor?._id;

            if (!bookingId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.BOOKING_ID_MISSING })
                return
            }
            if (!vendorId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.VENDOR_ID_MISSING });
                return;
            }
            if (!action || !['accept', 'reject'].includes(action)) {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'Invalid action' });
                return;
            }
            await this.bookingService.acceptRejectReq(bookingId, vendorId.toString(), action, rejectionReason);
            res.status(HTTP_statusCode.OK).json({
                success: true,
                message: `Booking ${action}ed successfully`
            });
        } catch (error) {
            handleError(res, error, 'cancelBooking')
        }
    }

    checkIsBookingAccepted = async(req: AuthenticatedRequest, res: Response): Promise<void> =>{
        try {
            const userId = req.user?._id;
            const { vendorId, bookingId } = req.body;
            if (!userId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.USER_ID_MISSING });
                return;
            }

            const result = await this.bookingService.isBookingAccepted(userId.toString(), vendorId, bookingId);
            if (result !== null) {
                res.status(HTTP_statusCode.OK).json({ success: true, result: result })
            } else {
                res.json({ success: false })
            }
        } catch (error) {
            handleError(res, error, 'checkIsBookingAccepted')
        }
    }

    makePayment = async(req: Request, res: Response): Promise<void> =>{
        try {

            const { companyName, bookingData, paymentMethod } = req.body;
            let advanceAmount = bookingData.advancePayment.amount;

            if (paymentMethod === 'stripe') {
                const result = await this.bookingService.makeBookingPayment(companyName, advanceAmount, bookingData)

                if (result) {
                    res.cookie('bookingId', bookingData?._id, { httpOnly: true, secure: process.env.NODE_ENV === 'production', })
                    res.cookie('amount', bookingData?.advancePayment?.amount, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })
                    res.cookie('paymentId', result.id, { httpOnly: true, secure: process.env.NODE_ENV === 'production', });
                    res.status(HTTP_statusCode.OK).json({ success: true, result, bookingData })
                } else {
                    res.redirect(`${process.env.FRONTEND_URL}/paymentFailed`)
                }
            }
        } catch (error) {
            handleError(res, error, 'makePayment')
        }
    }

    verifyPayment = async(req: Request, res: Response): Promise<void> =>{
        try {

            const bookingId = req.cookies.bookingId;
            const amountPaid = req.cookies.amount;
            const paymentId = req.cookies.paymentId;

            if (!bookingId || !amountPaid || !paymentId) {
                res.status(HTTP_statusCode.BadRequest).json({
                    success: false,
                    message: Messages.MISSING_PAYMENT_INFO
                });
                return;
            }
            const confirmedBooking = await this.bookingService.confirmPayment(bookingId, amountPaid, paymentId);

            if (confirmedBooking) {
                res.clearCookie('bookingId');
                res.clearCookie('amount');
                res.clearCookie('paymentId');
                res.redirect(`${process.env.FRONTEND_URL}/paymentSuccess`)
            } else {
                res.redirect(`${process.env.FRONTEND_URL}/paymentFailed`)
                res.status(HTTP_statusCode.BadRequest).json({
                    success: false,
                    message: Messages.FAILED_CONFIRM_PAYMENT
                });
            }
        } catch (error) {
            handleError(res, error, 'verifyPayment')
        }
    }

    makeMFPayment = async(req: Request, res: Response): Promise<void> =>{
        try {

            const paymentData = req.body;
            
            if (paymentData.paymentMethod === 'stripe') {
                const result = await this.bookingService.makeMFPayments(paymentData)                

                if (result) {
                    setCookies(res, {
                        bookingcId: paymentData?.bookingId,
                        finalAmount: paymentData.sbooking.finalPayment.amount,
                        paymentcId: result.id,
                    });
                    res.status(HTTP_statusCode.OK).json({ success: true, result, paymentData })
                }
            }
        } catch (error) {
            handleError(res, error, 'makeMFPayment')
        }
    }

    verifyMFPayment = async(req: Request, res: Response): Promise<void> =>{
        try {
            const { finalAmount, bookingcId, paymentcId } = req.cookies;
            
            if (!bookingcId || !finalAmount  || !paymentcId) {
                res.status(HTTP_statusCode.BadRequest).json({
                    success: false,
                    message: Messages.MISSING_PAYMENT_INFO
                });
                return;
            }
            const confirmedBooking = await this.bookingService.confirmMFPayment(
                bookingcId,
                parseFloat(finalAmount),
                paymentcId,
                'finalAmount'
            );
            
            if (confirmedBooking.success) {
                res.clearCookie('bookingcId');
                res.clearCookie('finalAmount');
                res.clearCookie('paymentcId');
                res.redirect(`${process.env.FRONTEND_URL}/paymentSuccess`)
            } else {
                res.redirect(`${process.env.FRONTEND_URL}/paymentFailed`)
                res.status(HTTP_statusCode.BadRequest).json({
                    success: false,
                    message: Messages.FAILED_CONFIRM_PAYMENT
                });
            }
        } catch (error) {
            handleError(res, error, 'verifyPayment')
        }
    }

    bookingCancel = async(req: AuthenticatedRequest, res: Response): Promise<void> =>{
        try {
            const { bookingId } = req.params;
            const userId = req.user?._id;

            if (!userId) {
                res.status(404).json({ message: Messages.USER_ID_MISSING });
                return;
            }
            const result = await bookingRequestModel.findOne({
                _id: bookingId,
                user_id: userId
            })

            res.status(HTTP_statusCode.OK).json({
                success: true,
                result
            });

        } catch (error) {
            handleError(res, error, 'bookingCancel')
        }
    }

    refundCancelAmt = async(req: AuthenticatedRequest, res:Response):Promise<void>=>{
        try {    
            const {bookingId, cancellationReason } =req.body;
            
            if (!bookingId) {
                throw new Error(Messages.BOOKING_ID_MISSING)
            }
            const result = await this.bookingService.cancelBooking(bookingId,cancellationReason);
            
            res.status(HTTP_statusCode.OK).json({ 
                success: true,
                message: Messages.BOOKING_CANCELLED
            });
        } catch (error) {
            handleError(res, error, 'refundCancelAmt')
        }
    }



}

export default BookingController

function setCookies(res: Response, cookies: Record<string, string | number>): void {
    Object.entries(cookies).forEach(([key, value]) => {
        res.cookie(key, value, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    });
}
