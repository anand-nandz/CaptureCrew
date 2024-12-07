import { BaseRepository } from "./baseRepository";

import Booking,{ BookingDocument ,BookingInterface, BookingStatus, PaymentStatus} from "../models/bookingModel";
import { CustomError } from "../error/customError";


class BookingRepo extends BaseRepository<BookingDocument> {
    constructor() {
        super(Booking)
    }

    async findBookingConfirmedReqs(userId: string): Promise<BookingInterface[] | null> {
        try {
            const ConfirmedBooking = await Booking
                .find({ userId: userId })
                .populate('userId', 'name email contactinfo isActive transactions')
                .populate('vendorId', 'name companyName bookedDates contactinfo city isActive transactions')
                .populate({
                    path: 'packageId',
                    model: 'Package', 
                    select: 'price description features photographerCount serviceType duration videographerCount customizationOptions'
                })
                .sort({ createdAt: -1 })
                .lean()

            return ConfirmedBooking
        } catch (error) {
            console.error('Error in saving findBookingRequests:', error);
            throw error;
        }
    }

    async findBookingConfirmedReqsV(vendorId: string): Promise<BookingInterface[] | null> {
        try {
            const ConfirmedBooking = await Booking
                .find({ vendorId: vendorId })
                .populate('vendorId', 'name companyName bookedDates contactinfo city isActive')
                .populate({
                    path: 'packageId',
                    model: 'Package', 
                    select: 'price description features photographerCount serviceType duration videographerCount customizationOptions'
                })
                .sort({ createdAt: -1 })
                .lean()

            return ConfirmedBooking
        } catch (error) {
            console.error('Error in saving findBookingRequests:', error);
            throw error;
        }
    }

    async getBookingReqsVendor(vendorId: string): Promise<BookingInterface[] | null> {
        try {
            const bookingReq = await Booking
                .find({ vendor_id: vendorId })
                .populate('user_id', 'name email contactinfo isActive')
                .populate('vendor_id', 'name companyName bookedDates contactinfo city isActive')
                .populate({
                    path: 'packageId',
                    model: 'Package', 
                    select: 'price description features photographerCount serviceType duration videographerCount customizationOptions'
                })
                .sort({ createdAt: -1 })
                .lean();


            const validBookings = bookingReq.filter(booking => booking.packageId !== null);

            return validBookings;
        } catch (error) {
            console.error('Error in getBookingReqsVendor:', error);
            throw error;
        }
    }

    async updatePayment(bookingId: string, amountPaid: number, paymentId: string, paymentType:'finalAmount'): Promise<BookingDocument> {
        try {
            const booking = await this.getById(bookingId);
            
            if (!booking) {
                throw new CustomError('Booking not found', 404);
            }

            if (paymentType === 'finalAmount') {

                if (booking.finalPayment.status !== PaymentStatus.Pending) {
                    throw new CustomError('Final payment is already completed or not required.', 400);
                }
                if (Number(amountPaid) !== booking.finalPayment.amount) {
                    throw new CustomError('Incorrect final payment amount.', 400);
                }
                if (new Date() > new Date(booking.finalPayment.dueDate)) {
                    throw new CustomError('Final payment is overdue.', 400);
                }

                booking.finalPayment = {
                    ...booking.finalPayment,
                    status: PaymentStatus.Completed,
                    paymentId: paymentId || '',
                    paidAt: new Date(),
                };
                booking.bookingStatus = BookingStatus.Completed

                
            } else {
                throw new CustomError('Invalid payment type.', 400);
            }

            const updatedBooking = await booking.save();            
            return updatedBooking;

        } catch (error) {
            console.error('Error in confirming MFPayment:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to confirm payment.', 500);
        }
    }

    
    async getAllBookings(){
        try {
         const bookings = await Booking.find()
         .populate('userId')
         .populate('vendorId')
         .populate('packageId')
         .sort({createdAt: -1})
            
         return bookings
        } catch (error) {
            console.error('Error in getting all booking Req:', error);
            throw error;
        }
    }

    async findBooking(bookingId: string): Promise<BookingDocument | null> {
        try {
            console.log(bookingId);
            
            const ConfirmedBooking = await Booking
                .findOne({ bookingId: bookingId })
                .populate('userId', 'name email contactinfo')
                .populate('vendorId', 'name companyName bookedDates contactinfo isActive')
                .sort({ createdAt: -1 })
                .lean() as BookingDocument | null

            return ConfirmedBooking
        } catch (error) {
            console.error('Error in saving findBooking:', error);
            throw error;
        }
    }

   

}

export default new BookingRepo();