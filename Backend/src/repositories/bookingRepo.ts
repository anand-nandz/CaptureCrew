import { BaseRepository } from "./baseRepository";

import Booking, { BookingDocument } from "../models/bookingModel";
import { CustomError } from "../error/customError";
import { BookingStatus, PaymentStatus } from "../enums/commonEnums";
import { BookingInterface } from "../interfaces/commonInterfaces";
import { IBookingRepository } from "../interfaces/repositoryInterfaces/booking.Repository.interface";
import mongoose from "mongoose";
import HTTP_statusCode from "../enums/httpStatusCode";


class BookingRepo extends BaseRepository<BookingDocument> implements IBookingRepository {
    constructor() {
        super(Booking)
    }

    async saveBooking(bookingData: Partial<BookingInterface>): Promise<BookingInterface> {
        const confirmedBooking = new Booking(bookingData);
        return await confirmedBooking.save();
    }


    findBookingConfirmedReqs = async (userId: string): Promise<BookingInterface[] | null> => {
        try {
            
            const ConfirmedBooking = await Booking.aggregate([
                {
                    $match: { userId: new mongoose.Types.ObjectId(userId) } 
                },
                {
                    $lookup: {
                        from: 'users', 
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                {
                    $lookup: {
                        from: 'vendors', 
                        localField: 'vendorId',
                        foreignField: '_id',
                        as: 'vendorDetails'
                    }
                },
                {
                    $lookup: {
                        from: 'packages', 
                        localField: 'packageId',
                        foreignField: '_id',
                        as: 'packageDetails'
                    }
                },
                {
                    $lookup: {
                        from: 'reviews', 
                        let: { bookingId: '$_id', userId: new mongoose.Types.ObjectId(userId) },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$bookingId', '$$bookingId'] },
                                            { $eq: ['$userId', '$$userId'] }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    bookingId: 1,
                                    rating: 1,
                                    content: 1,
                                    userId: 1,
                                    vendorId: 1,
                                    createdAt: 1,
                                    updatedAt: 1
                                }
                            }
                        ],
                        as: 'reviews'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        bookingId: 1,
                        clientName: 1,
                        email: 1,
                        phone: 1,
                        venue: 1,
                        serviceType: 1,
                        startingDate: 1,
                        noOfDays: 1,
                        totalAmount: 1,
                        advancePayment: 1,
                        finalPayment: 1,
                        bookingStatus: 1,
                        requestedDates: 1,
                        customizations: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        userId: {
                            _id: { $arrayElemAt: ['$userDetails._id', 0] },
                            name: { $arrayElemAt: ['$userDetails.name', 0] },
                            email: { $arrayElemAt: ['$userDetails.email', 0] },
                            contactinfo: { $arrayElemAt: ['$userDetails.contactinfo', 0] },
                            transactions: { $arrayElemAt: ['$userDetails.transactions', 0] },
                            isActive: { $arrayElemAt: ['$userDetails.isActive', 0] }
                        },
                        vendorId: {
                            _id: { $arrayElemAt: ['$vendorDetails._id', 0] },
                            name: { $arrayElemAt: ['$vendorDetails.name', 0] },
                            companyName: { $arrayElemAt: ['$vendorDetails.companyName', 0] },
                            contactinfo: { $arrayElemAt: ['$vendorDetails.contactinfo', 0] },
                            city: { $arrayElemAt: ['$vendorDetails.city', 0] },
                            isActive: { $arrayElemAt: ['$vendorDetails.isActive', 0] },
                            transactions: { $arrayElemAt: ['$vendorDetails.transactions', 0] },
                            bookedDates: { $arrayElemAt: ['$vendorDetails.bookedDates', 0] }
                        },
                        packageId: {
                            _id: { $arrayElemAt: ['$packageDetails._id', 0] },
                            description: { $arrayElemAt: ['$packageDetails.description', 0] },
                            features: { $arrayElemAt: ['$packageDetails.features', 0] },
                            photographerCount: { $arrayElemAt: ['$packageDetails.photographerCount', 0] },
                            price: { $arrayElemAt: ['$packageDetails.price', 0] },
                            customizationOptions: { $arrayElemAt: ['$packageDetails.customizationOptions', 0] }
                        },
                        reviews: { $arrayElemAt: ['$reviews', 0] } 
                    }
                },
                {
                    $sort: { createdAt: -1 } 
                }
            ]);
            

            return ConfirmedBooking
        } catch (error) {
            console.error('Error in saving findBookingRequests:', error);
            throw error;
        }
    }

    findBookingConfirmedReqsV = async (vendorId: string): Promise<BookingInterface[] | null> => {
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

    // async getBookingReqsVendor(vendorId: string): Promise<BookingInterface[] | null> {
    //     try {
    //         const bookingReq = await Booking
    //             .find({ vendor_id: vendorId })
    //             .populate('user_id', 'name email contactinfo isActive')
    //             .populate('vendor_id', 'name companyName bookedDates contactinfo city isActive')
    //             .populate({
    //                 path: 'packageId',
    //                 model: 'Package', 
    //                 select: 'price description features photographerCount serviceType duration videographerCount customizationOptions'
    //             })
    //             .sort({ createdAt: -1 })
    //             .lean();


    //         const validBookings = bookingReq.filter(booking => booking.packageId !== null);

    //         return validBookings;
    //     } catch (error) {
    //         console.error('Error in getBookingReqsVendor:', error);
    //         throw error;
    //     }
    // }

    updatePayment = async(bookingId: string, amountPaid: number, paymentId: string, paymentType: 'finalAmount'): Promise<BookingDocument> =>{
        try {
            const booking = await this.getById(bookingId);

            if (!booking) {
                throw new CustomError('Booking not found', 404);
            }

            if (paymentType === 'finalAmount') {

                if (booking.finalPayment.status !== PaymentStatus.Pending) {
                    throw new CustomError('Final payment is already completed or not required.', HTTP_statusCode.BadRequest);
                }
                if (Number(amountPaid) !== booking.finalPayment.amount) {
                    throw new CustomError('Incorrect final payment amount.', HTTP_statusCode.BadRequest);
                }
                if (new Date() > new Date(booking.finalPayment.dueDate)) {
                    throw new CustomError('Final payment is overdue.', HTTP_statusCode.BadRequest);
                }

                booking.finalPayment = {
                    ...booking.finalPayment,
                    status: PaymentStatus.Completed,
                    paymentId: paymentId || '',
                    paidAt: new Date(),
                };

                booking.bookingStatus = BookingStatus.Completed

            } else {
                throw new CustomError('Invalid payment type.', HTTP_statusCode.BadRequest);
            }

            const updatedBooking = await booking.save();
            return updatedBooking;

        } catch (error) {
            console.error('Error in confirming MFPayment:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to confirm payment.', HTTP_statusCode.InternalServerError);
        }
    }

    getAllBookings = async (search?: string): Promise<BookingInterface[]> => {
        try {
            let query: { [key: string]: any } = {};

            if (search) {
                query = {
                    $or: [
                        { bookingId: { $regex: search, $options: 'i' } },
                        { serviceType: { $regex: search, $options: 'i' } },
                       
                    ]
                }
            }

            const bookings = await Booking.find(query)
                .populate('userId')
                .populate('vendorId')
                .populate('packageId')
                .sort({ createdAt: -1 })

            return bookings
        } catch (error) {
            console.error('Error in getting all booking Req:', error);
            throw error;
        }
    }

    findBooking = async(bookingId: string): Promise<BookingDocument | null> =>{
        try {
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

    async updateBookingStatus(bookingId: string, update: object): Promise<void> {
        await Booking.findByIdAndUpdate(bookingId, update);
    }

    getRevenueData = async (
        vendorId: string,
        start: Date,
        end: Date,
        groupBy: object,
        sortField: string
    ): Promise<{ _id: { [key: string]: number }; totalRevenue: number }[]> => {
        try {
            const revenueData = await Booking.aggregate([
                {
                    $match: {
                        vendorId: new mongoose.Types.ObjectId(vendorId),
                    },
                },
                {
                    $project: {
                        validAdvanceAmount: {
                            $cond: [
                                { $eq: ['$advancePayment.status', 'completed'] },
                                '$advancePayment.amount',
                                0
                            ]
                        },
                        validFinalAmount: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$finalPayment.status', 'completed'] },
                                        { $ne: ['$finalPayment.paidAt', null] }
                                    ]
                                },
                                '$finalPayment.amount',
                                0
                            ]
                        },
                        paidAt: {
                            $ifNull: ['$finalPayment.paidAt', '$advancePayment.paidAt']
                        }
                    }
                },
                {
                    $project: {
                        totalAmount: { $add: ['$validAdvanceAmount', '$validFinalAmount'] },
                        paidAt: 1
                    }
                },
                {
                    $match: {
                        paidAt: { $gte: start, $lt: end }
                    }
                },
                {
                    $group: {
                        _id: {
                            [sortField]: groupBy
                        },
                        totalRevenue: { $sum: '$totalAmount' }
                    }
                },
                { $sort: { [`_id.${sortField}`]: 1 } }
            ]);

            return revenueData;
        } catch (error) {
            console.error('Error fetching revenue data in repository:', error);
            throw new Error('Unable to fetch revenue data');
        }
    }


    getAllRevenueData = async (
        start: Date,
        end: Date,
        groupBy: object,
        sortField: string
    ): Promise<{ _id: { [key: string]: number }; totalRevenue: number }[]> => {
        try {
            const revenueData = await Booking.aggregate([
                {
                    $project: {
                        validAdvanceAmount: {
                            $cond: [
                                { $eq: ['$advancePayment.status', 'completed'] },
                                '$advancePayment.amount',
                                0
                            ]
                        },
                        validFinalAmount: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$finalPayment.status', 'completed'] },
                                        { $ne: ['$finalPayment.paidAt', null] }
                                    ]
                                },
                                '$finalPayment.amount',
                                0
                            ]
                        },
                        paidAt: {
                            $ifNull: ['$finalPayment.paidAt', '$advancePayment.paidAt']
                        }
                    }
                },
                {
                    $project: {
                        totalAmount: { $add: ['$validAdvanceAmount', '$validFinalAmount'] },
                        paidAt: 1
                    }
                },
                {
                    $match: {
                        paidAt: { $gte: start, $lt: end }
                    }
                },
                {
                    $group: {
                        _id: {
                            [sortField]: groupBy
                        },
                        totalRevenue: { $sum: '$totalAmount' }
                    }
                },
                { $sort: { [`_id.${sortField}`]: 1 } }
            ]);

            return revenueData;
        } catch (error) {
            console.error('Error fetching revenue data in repository:', error);
            throw new Error('Unable to fetch revenue data');
        }
    }



}

export default BookingRepo;