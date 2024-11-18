import mongoose from "mongoose";
import BookingRequest, { BookingAcceptanceStatus, BookingInterface, BookingReqDocument } from "../models/bookingRequestModel";
import Vendor, { VendorDocument } from "../models/vendorModel";
import { BaseRepository } from "./baseRepository";
import { CustomError } from "../error/customError";
import generateUniqueId from "../utils/extraUtils";


class BookingRepository extends BaseRepository<BookingReqDocument> {
    constructor() {
        super(BookingRequest)
    }

    async checkIsAvailable(startingDate: string, vendorId: string): Promise<boolean | undefined> {
        try {
            const vendor = await Vendor.findById(vendorId);

            const [year, month, day] = startingDate.split('-')
            let newDate = `${day}/${month}/${year}`
            console.log(newDate, 'newDate in the check is availble');

            if (vendor) {
                if (vendor.bookedDates.includes(newDate)) {
                    return false
                } else {
                    return true
                }
            }

        } catch (error) {
            return undefined
        }
    }

    async saveBookingReq(
        userId: string,
        vendorId: string,
        startingDate: string,
        noOfDays: string,
        name: string,
        email: string,
        phone: string,
        venue: string,
        serviceType: string,
        packageId: string | mongoose.Types.ObjectId,
        totalPrice: number,
        message: string,
        bookingStatus: BookingAcceptanceStatus,
        customizations: string[] | undefined,
    ): Promise<BookingInterface | null> {
        try {
            const existingBooking = await BookingRequest.findOne({
                vendor_id: new mongoose.Types.ObjectId(vendorId),
                user_id: new mongoose.Types.ObjectId(userId),
                startingDate: startingDate,
                serviceType: serviceType
            });

            if (existingBooking) {
                throw new CustomError(
                    'You already have a booking with this vendor for this date and service type',
                    400
                );
            }

            let bookingReqId = generateUniqueId('ID');
            const checkExisting = await BookingRequest.findOne({ bookingReqId: bookingReqId })
            if (checkExisting) {
                bookingReqId = generateUniqueId('ID')
            }

            const advancePaymentAmount = Math.round(totalPrice * 0.30);

            const advancePaymentDueDate = new Date();
            advancePaymentDueDate.setDate(advancePaymentDueDate.getDate() + 3);

            const bookingData = {
                vendor_id: new mongoose.Types.ObjectId(vendorId),
                user_id: new mongoose.Types.ObjectId(userId),
                name,
                email,
                phone,
                venue,
                bookingReqId: bookingReqId,
                serviceType,
                packageId: typeof packageId === 'string' ? new mongoose.Types.ObjectId(packageId) : packageId,
                totalPrice,
                message,
                startingDate,
                noOfDays,
                bookingStatus,
                customizations,
                advancePaymentDueDate: advancePaymentDueDate,
                advancePayment: {
                    amount: advancePaymentAmount,
                    status: 'pending'
                }
            };
            const newBookingData = await BookingRequest.create(bookingData)
            newBookingData.save()
            console.log(newBookingData, 'newbookingdat in  repository');

            return newBookingData
        } catch (error) {
            console.error('Error in saving BookingReq:', error);
            throw error;
        }
    }

    async findBookingRequests(userId: string): Promise<BookingInterface[] | null> {
        try {
            const bookingReq = await BookingRequest
                .find({ user_id: userId })
                .populate('vendor_id', 'name companyName bookedDates contactinfo city isActive')
                .populate({
                    path: 'packageId',
                    model: 'Package', // Make sure this matches your Package model name
                    select: 'price description features photographerCount serviceType duration videographerCount customizationOptions'
                })
                .sort({ createdAt: -1 })
                .lean()
            console.log('bboking req userSide :', bookingReq);

            return bookingReq
        } catch (error) {
            console.error('Error in saving findBookingRequests:', error);
            throw error;
        }
    }

    async getBookingReqsVendor(vendorId: string): Promise<BookingInterface[] | null> {
        try {
            const bookingReq = await BookingRequest
                .find({ vendor_id: vendorId })
                .populate('user_id', 'name email contactinfo isActive')
                .populate('vendor_id', 'name companyName bookedDates contactinfo city isActive')
                .populate({
                    path: 'packageId',
                    model: 'Package', // Make sure this matches your Package model name
                    select: 'price description features photographerCount serviceType duration videographerCount customizationOptions'
                })
                .sort({ createdAt: -1 })
                .lean();


            // Filter out any bookings with invalid package references
            const validBookings = bookingReq.filter(booking => booking.packageId !== null);

            // if (validBookings.length !== bookingReq.length) {
            //     console.warn(`Found ${bookingReq.length - validBookings.length} bookings with invalid package references`);
            // }

            return validBookings;
        } catch (error) {
            console.error('Error in getBookingReqsVendor:', error);
            throw error;
        }
    }

    async deleteReq(bookingId: string, userId: string): Promise<boolean> {
        try {
            const booking = await BookingRequest.findOne({ _id: bookingId, user_id: userId });
            if (booking?.bookingStatus === BookingAcceptanceStatus.Accepted || booking?.bookingStatus === BookingAcceptanceStatus.Rejected) {
                throw new CustomError(`Booking has been ${booking.bookingStatus} alraedy.Refresh the page`, 400)
            }
            if (!booking) {
                throw new CustomError('Booking not found', 400)
            }
            booking.bookingStatus = BookingAcceptanceStatus.Revoked
            await booking.save();
            console.log(booking, 'book after delete');

            return true
        } catch (error) {
            console.error('Error in deleteing boking Req:', error);
            throw error;
        }
    }

    async acceptUpdate(vendorId: string, requestedDates: string[]): Promise<boolean> {
        try {
            const update = await Vendor.findByIdAndUpdate(
                vendorId,
                {
                    $addToSet: { bookedDates: { $each: requestedDates } }
                },
                { new: true }
            )

            console.log(update, 'updated');

            return true

        } catch (error) {
            console.error('Error in accepting booking Req:', error);
            throw error;
        }
    }

    async rollbackVendorDates(vendorId: string, datesToRemove: string[]): Promise<void> {
        try {
            await Vendor.findByIdAndUpdate(
                vendorId,
                {
                    $pull: { bookedDates: { $in: datesToRemove } }
                }
            );
        } catch (error) {
            console.error('Error rolling back vendor dates:', error);
            // Log this error but don't throw, as this is already in an error handling block
        }
    }

    async getAllBookings(){
        try {
            const allBookings = await BookingRequest.find()
            return allBookings
        } catch (error) {
            console.error('Error in getting all booking Req:', error);
            throw error;
        }
    }


}

export default new BookingRepository();