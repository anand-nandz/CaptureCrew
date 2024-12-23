import mongoose from "mongoose";
import BookingRequest, { BookingReqDocument } from "../models/bookingRequestModel";
import Vendor, { VendorDocument } from "../models/vendorModel";
import { BaseRepository } from "./baseRepository";
import { CustomError } from "../error/customError";
import generateUniqueId from "../utils/extraUtils";
import { IBookingReqRepository } from "../interfaces/repositoryInterfaces/bookingReq.Repository.Interface";
import { BookingReqInterface } from "../interfaces/commonInterfaces";
import { BookingAcceptanceStatus } from "../enums/commonEnums";


class BookingRepository extends BaseRepository<BookingReqDocument> implements IBookingReqRepository{
    constructor() {
        super(BookingRequest)
    }

    async checkIsAvailable(startingDate: string, vendorId: string): Promise<boolean | undefined> {
        try {
            const vendor = await Vendor.findById(vendorId);

            const [year, month, day] = startingDate.split('-')
            let newDate = `${day}/${month}/${year}`

            if (vendor) {
                if (vendor.bookedDates.includes(newDate)) {
                    return false
                } else {
                    return true
                }
            }

        } catch (error) {
            throw error
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
    ): Promise<BookingReqInterface | null> {
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
            return newBookingData
        } catch (error) {
            console.error('Error in saving BookingReq:', error);
            throw error;
        }
    }

    findBookingRequests = async(userId: string): Promise<BookingReqInterface[] | null> =>{
        try {
            const bookingReq = await BookingRequest
                .find({ user_id: userId })
                .populate('vendor_id', 'name companyName bookedDates contactinfo city isActive')
                .populate({
                    path: 'packageId',
                    model: 'Package', 
                    select: 'price description features photographerCount serviceType duration videographerCount customizationOptions'
                })
                .sort({ createdAt: -1 })
                .lean()

            return bookingReq
        } catch (error) {
            console.error('Error in saving findBookingRequests:', error);
            throw error;
        }
    }

    findBookingById = async(userId: string, vendorId: string, bookingId: string): Promise<BookingReqDocument | null> =>{
        try {
            const bookingData = await BookingRequest.findOne({
                user_id: userId,
                vendor_id: vendorId,
                _id: bookingId
            })

            if(!bookingData) return null
            return bookingData
        } catch (error) {
            console.error('Error in findBookingById:', error);
            throw error;
        }
    }

    getBookingReqsVendor = async(vendorId: string): Promise<BookingReqInterface[] | null> =>{
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
            const booking = await BookingRequest.findOneAndUpdate(
                {
                    _id: bookingId,
                    user_id: userId,
                    bookingStatus: BookingAcceptanceStatus.Requested
                },
                {
                    $set: { bookingStatus: BookingAcceptanceStatus.Revoked }
                },
                {
                    new: true
                }
            );
    
            if (!booking) {
                // Combine status and existence check in a single query
                throw new CustomError(
                    'Booking not found or status is not "Requested"',
                    404
                );
            }
    
            return true;
        }  catch (error) {
            console.error('Error in deleteing boking Req:', error);
            throw error;
        }
    }

    async deleteBookingRequest(bookingId: string): Promise<void> {
        await BookingRequest.findByIdAndDelete(bookingId);
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
            if (!update) {
                console.error(`Vendor with ID ${vendorId} not found or update failed.`);
                return false;
            }
            return true

        } catch (error) {
            console.error('Error in accepting booking Req:', error);
            throw new Error('Failed to update vendor with requested dates.');
        }
    }

    rollbackVendorDates = async(vendorId: string, datesToRemove: string[]): Promise<void> =>{
        try {
            await Vendor.findByIdAndUpdate(
                vendorId,
                {
                    $pull: { requestedDates: { $in: datesToRemove } }
                }
            );
        } catch (error) {
            console.error('Error rolling back vendor dates:', error);
        }
    }

    async overdueBookings() {
        const now = new Date();
        try {
            const result = await BookingRequest.find({
                bookingStatus: BookingAcceptanceStatus.Accepted,
                advancePaymentDueDate: { $lt: now },
                'advancePayment.status': 'pending'
            }).populate('vendor_id', 'email bookedDates')
            return result
        } catch (error) {
            console.error('Error in finding overdue b0oking dates:', error);
            throw error;
        }
    }

    validateBooking=  async(bookingId: string, userId: string, expectedStatus: BookingAcceptanceStatus): Promise<BookingReqDocument> =>{
        const booking = await BookingRequest.findOne({
            _id: bookingId,
            user_id: userId
        });
    
        if (!booking) {
            throw new CustomError('Booking not Found', 404);
        }
    
        if (booking.bookingStatus !== expectedStatus) {
            throw new CustomError(
                `Cannot perform operation. Current status: ${booking.bookingStatus}`,
                400
            );
        }
    
        return booking;
    }
    

}

export default BookingRepository;