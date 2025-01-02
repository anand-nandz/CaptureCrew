
import { CustomError, StripeRefundError } from '../error/customError';
import userRepository from '../repositories/userRepository';
import bookingRepository from '../repositories/bookingRepository';
import bookingRequestModel, { BookingReqDocument } from '../models/bookingRequestModel';
import vendorRepository from '../repositories/vendorRepository';
import { v4 as uuidv4 } from 'uuid';
import packageRepository from '../repositories/packageRepository';
import mongoose from 'mongoose';
import { sendEmail } from '../utils/sendEmail';
import { emailTemplates } from '../utils/emailTemplates';
import paymentService from './paymentService';
import bookingModel, { BookingDocument } from '../models/bookingModel';
import cron from 'node-cron';
import bookingRepo from '../repositories/bookingRepo';
import userModel from '../models/userModel';
import vendorModel from '../models/vendorModel';
import { BookingCancellationPolicyImpl } from '../utils/bookingPolicyService';
import Stripe from 'stripe';
import { BookingAcceptanceStatus, BookingStatus, PaymentMethod, PaymentStatus, PaymentType, TransactionType } from '../enums/commonEnums';
import { IBookingService } from '../interfaces/serviceInterfaces/booking.Service.interface';
import { IBookingReqRepository } from '../interfaces/repositoryInterfaces/bookingReq.Repository.Interface';
import { BookingInterface, BookingReqInterface, BookingVendorResponse, CancelBookingResult, PaymentData, RefundResult } from '../interfaces/commonInterfaces';
import { IBookingRepository } from '../interfaces/repositoryInterfaces/booking.Repository.interface';
import { IUserRepository } from '../interfaces/repositoryInterfaces/user.repository.Interface';
import { IPaymentService } from '../interfaces/serviceInterfaces/payment.Service.Interface';
import { IVendorRepository } from '../interfaces/repositoryInterfaces/vendor.Repository.interface';
import { IPackageRepository } from '../interfaces/repositoryInterfaces/package.repository.intrface';
import HTTP_statusCode from '../enums/httpStatusCode';
import Messages from '../enums/errorMessage';

class BookingService implements IBookingService {

    private bookingRepository: IBookingReqRepository;
    private bookingRepo: IBookingRepository;
    private vendorRepository: IVendorRepository;
    private userRepository: IUserRepository;
    private paymentService: IPaymentService;
    private packageRepository: IPackageRepository;

    constructor(
        bookingRepository: IBookingReqRepository,
        bookingRepo: IBookingRepository,
        userRepository: IUserRepository,
        paymentService: IPaymentService,
        vendorRepository: IVendorRepository,
        packageRepository: IPackageRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.bookingRepo = bookingRepo;
        this.userRepository = userRepository;
        this.paymentService = paymentService;
        this.vendorRepository = vendorRepository;
        this.packageRepository = packageRepository
    }

    newBookingReq = async (
        bookingData: Partial<BookingReqInterface>,
        vendorId: string,
        userId: string
    ): Promise<{
        success: boolean,
        reqSend: boolean
    }> => {
        try {

            const [user, vendor] = await Promise.all([
                this.userRepository.getById(userId),
                this.vendorRepository.getById(vendorId)
            ])

            if (!user) throw new CustomError('No user found', HTTP_statusCode.NotFound);
            if (!vendor) throw new CustomError('No Vendor found', HTTP_statusCode.NotFound);
            if (bookingData.startingDate) {
                const slotAvailabilty = await this.bookingRepository.checkIsAvailable(bookingData.startingDate, vendorId);

                if (slotAvailabilty === true) {

                    if (!bookingData.packageId) {
                        throw new CustomError('Package ID is required', HTTP_statusCode.InternalServerError);
                    }
                    const pkgGot = typeof bookingData.packageId === 'string'
                        ? new mongoose.Types.ObjectId(bookingData.packageId)
                        : bookingData.packageId;

                    const pkgamt = await this.packageRepository.getById(pkgGot.toString());


                    if (!pkgamt || typeof pkgamt.price !== 'number') {
                        throw new CustomError('Invalid package or package price not found', HTTP_statusCode.InternalServerError);
                    }

                    const noOfDays = Number(bookingData.noOfDays);
                    if (isNaN(noOfDays) || noOfDays <= 0) {
                        throw new CustomError('Invalid number of days', HTTP_statusCode.InternalServerError);
                    }

                    let totalPrice = noOfDays * pkgamt.price;

                    if (
                        bookingData.customizations &&
                        bookingData.customizations.length > 0 &&
                        pkgamt.customizationOptions
                    ) {
                        const customizationCosts = bookingData.customizations.reduce((total, optionId) => {
                            const option = pkgamt.customizationOptions.find(
                                opt => opt._id.toString() === optionId
                            );
                            return total + (option?.price || 0)
                        }, 0);
                        totalPrice += customizationCosts
                    }

                    if (totalPrice !== bookingData.totalPrice) {
                        throw new CustomError('Price mismatch in calculations', HTTP_statusCode.InternalServerError);
                    }

                    const createBookingReq = await this.bookingRepository.saveBookingReq(
                        userId,
                        vendorId,
                        bookingData.startingDate,
                        bookingData.noOfDays?.toString() || "1",
                        bookingData.name || "",
                        bookingData.email || "",
                        bookingData.phone || "",
                        bookingData.venue || "",
                        bookingData.serviceType || "",
                        bookingData.packageId,
                        bookingData.totalPrice || totalPrice,
                        bookingData.message || "",
                        BookingAcceptanceStatus.Requested,
                        bookingData.customizations
                    );

                    if (createBookingReq) {
                        if (vendor.email) {
                            await sendEmail(
                                vendor.email,
                                'New Booking Request - CaptureCrew',
                                emailTemplates.newBookingRequest(vendor.name, {
                                    customerName: bookingData.name || "",
                                    serviceType: bookingData.serviceType || "",
                                    venue: bookingData.venue || "",
                                    startingDate: bookingData.startingDate || "",
                                    bookingReqId: createBookingReq.bookingReqId,
                                    totalPrice: bookingData.totalPrice || totalPrice,
                                    noOfDays: bookingData.noOfDays || 1,
                                    customerEmail: bookingData.email || "",
                                    customerPhone: bookingData.phone || "",
                                    message: bookingData.message || ""
                                })
                            );
                        }
                        if (user.email && bookingData.email) {
                            await sendEmail(
                                [user.email, bookingData.email],
                                'Booking Request Submitted - CaptureCrew',
                                emailTemplates.bookingRequestConfirmation({
                                    customerName: bookingData.name || "",
                                    vendorName: vendor.name,
                                    serviceType: bookingData.serviceType || "",
                                    venue: bookingData.venue || "",
                                    startingDate: bookingData.startingDate || "",
                                    bookingReqId: createBookingReq.bookingReqId,
                                    totalPrice: bookingData.totalPrice || totalPrice,
                                    noOfDays: bookingData.noOfDays || 1,
                                })
                            );
                        }

                        if (createBookingReq !== null) {
                            return { success: true, reqSend: true }
                        } else {
                            return { success: false, reqSend: false }
                        }
                    }
                    return { success: false, reqSend: false };
                }
            }
            return { success: false, reqSend: false };

        } catch (error) {
            console.error('Error in newBookingReq:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to create new Booking Request.', HTTP_statusCode.InternalServerError);
        }
    }

    getBookingRequests = async (userId: string): Promise<{
        success: boolean,
        bookingRequest?: BookingReqInterface[] | null,
        bookingConfirmed?: BookingInterface[] | null
    }> => {
        try {

            const [result, confirmed] = await Promise.all([
                this.bookingRepository.findBookingRequests(userId),
                this.bookingRepo.findBookingConfirmedReqs(userId)
            ]);

            if (result !== null) {
                return { success: true, bookingRequest: result, bookingConfirmed: confirmed }
            } else {
                return { success: false, bookingRequest: [], bookingConfirmed: [] }
            }

        } catch (error) {
            console.error('Error in findBookingRequsts:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to find Booking Requests.', HTTP_statusCode.InternalServerError);
        }
    }

    bookingReqsVendor = async (vendorId: string): Promise<BookingVendorResponse> => {
        try {
            const [result, confirmed] = await Promise.all([
                this.bookingRepository.getBookingReqsVendor(vendorId),
                this.bookingRepo.findBookingConfirmedReqsV(vendorId)
            ]);
            const bookingRequest = result && result.length > 0 ? result : [];
            const bookingConfirmed = confirmed || [];


            if (bookingRequest.length > 0 || bookingConfirmed.length > 0) {
                return {
                    success: true,
                    bookingRequest,
                    bookingConfirmed
                };
            } else {
                return {
                    success: false,
                    bookingRequest,
                    bookingConfirmed
                };
            }
        } catch (error) {
            console.error('Error in bookingReqsVendor:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to find Booking Requests.', HTTP_statusCode.InternalServerError);
        }
    }

    revokeRequest = async (bookingId: string, userId: string) => {
        try {
            await this.bookingRepository.validateBooking(bookingId, userId, BookingAcceptanceStatus.Requested);
            const revokeReq = await this.bookingRepository.deleteReq(bookingId, userId)

            return revokeReq
        } catch (error) {
            console.error('Error in revokeRequest:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to delete Booking Requests.', HTTP_statusCode.InternalServerError);
        }
    }

    acceptRejectReq = async (bookingId: string, vendorId: string, action: string, rejectionReason?: string): Promise<void> => {
        try {

            const [bookingReq, vendor] = await Promise.all([
                this.bookingRepository.getById(bookingId),
                this.vendorRepository.getById(vendorId)
            ]);

            if (!bookingReq) {
                throw new CustomError('No booking Request for this Id', HTTP_statusCode.NotFound)
            }
            if (!vendor) {
                throw new CustomError('Vendor not found', HTTP_statusCode.NotFound);
            }
            if (bookingReq.bookingStatus !== 'requested') {
                throw new CustomError('Booking has already been processed', HTTP_statusCode.InternalServerError);
            }

            const statusMap = {
                'accept': BookingAcceptanceStatus.Accepted,
                'reject': BookingAcceptanceStatus.Rejected
            };

            if (action === 'accept') {
                const requestedDates = this.calculateBookingDates(
                    bookingReq.startingDate,
                    bookingReq.noOfDays
                );

                const conflicts = this.checkDateConflicts(requestedDates, vendor.bookedDates);
                if (conflicts.hasConflict) {
                    throw new CustomError(
                        `Booking cannot be accepted. The following dates are unavailable: ${conflicts.conflictingDates.join(', ')}`,
                        HTTP_statusCode.InternalServerError
                    );
                }

                const dueDates = this.calculateDueDates(bookingReq.startingDate, bookingReq.noOfDays);

                const today = new Date();
                const daysTillEvent = Math.floor((dueDates.eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                if (daysTillEvent < 5) {
                    throw new CustomError(
                        'Booking cannot be accepted. Event date must be at least 5 days from today.',
                        HTTP_statusCode.InternalServerError
                    );
                }

                const { advanceAmount, finalAmount } = this.calculatePaymentAmounts(bookingReq.totalPrice);

                bookingReq.advancePaymentDueDate = dueDates.advancePaymentDue;
                bookingReq.advancePayment = {
                    amount: advanceAmount,
                    status: 'pending'
                };

                bookingReq.requestedDates = requestedDates;
                await bookingReq.save();

                await sendEmail(
                    bookingReq.email,
                    'Booking Confirmed - CaptureCrew',
                    emailTemplates.bookingAccepted(bookingReq.name, {
                        serviceType: bookingReq.serviceType,
                        venue: bookingReq.venue,
                        startingDate: bookingReq.startingDate,
                        noOfDays: bookingReq.noOfDays,
                        totalPrice: bookingReq.totalPrice,
                        advanceAmount: advanceAmount,
                        finalAmount: finalAmount,
                        advancePaymentDueDate: dueDates.advancePaymentDue.toLocaleDateString(),
                        finalPaymentDueDate: dueDates.finalPaymentDue.toLocaleDateString(),
                        bookingReqId: bookingReq.bookingReqId,
                        vendorName: vendor.name,
                        companyName: vendor.companyName,
                        vendorContact: vendor.contactinfo
                    })
                );
            }

            if (action === 'reject') {
                bookingReq.rejectionReason = rejectionReason;
                await sendEmail(
                    bookingReq.email,
                    'Booking Request Update - CaptureCrew',
                    emailTemplates.bookingRejected(bookingReq.name, bookingReq?.rejectionReason, {
                        serviceType: bookingReq.serviceType,
                        venue: bookingReq.venue,
                        startingDate: bookingReq.startingDate,
                        bookingReqId: bookingReq.bookingReqId,
                        vendorName: vendor.name,
                        companyName: vendor.companyName,
                        vendorContact: vendor.contactinfo
                    })
                )
            }


            bookingReq.bookingStatus = statusMap[action as keyof typeof statusMap];
            const updatedBooking = await this.bookingRepository.update(bookingId, bookingReq);

            if (!updatedBooking) {
                const requestedDates = this.calculateBookingDates(
                    bookingReq.startingDate,
                    bookingReq.noOfDays
                );
                if (action === 'accept') {
                    await this.bookingRepository.rollbackVendorDates(vendorId, requestedDates);
                }
                throw new CustomError('Failed to update booking status', HTTP_statusCode.InternalServerError);
            }

        } catch (error) {
            console.error("Error in acceptRejectReq", error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to acceptRejectReq', HTTP_statusCode.InternalServerError)
        }
    }



    fetchAllBookings = async (search?: string): Promise<{
        success: boolean;
        bookingRequest: BookingInterface[];
        totalCount: number;
        message?: string;
    }> => {
        try {
            const bookings = await this.bookingRepo.getAllBookings(search)
            if (bookings && bookings.length > 0) {
                return {
                    success: true,
                    bookingRequest: bookings,
                    totalCount: bookings.length
                };
            } else {
                return {
                    success: false,
                    bookingRequest: [],
                    totalCount: 0,
                    message: 'No bookings found'
                };
            }
        } catch (error) {
            console.error('Error in fetchAllBookings:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to fetchAllBookings.', HTTP_statusCode.InternalServerError);
        }
    }

    isBookingAccepted = async (
        userId: string,
        vendorId: string,
        bookingId: string
    ): Promise<BookingReqDocument | null> => {
        try {

            const [bookingData, vendor] = await Promise.all([
                this.bookingRepository.findBookingById(userId, vendorId, bookingId),
                this.vendorRepository.getById(vendorId)
            ]);

            if (!bookingData || !vendor) {
                return null;
            }

            const requestedDates = this.calculateBookingDates(
                bookingData.startingDate,
                bookingData.noOfDays
            );

            const conflicts = this.checkDateConflicts(requestedDates, vendor.bookedDates);
            if (conflicts.hasConflict) {
                throw new CustomError(
                    `Booking dates are no longer available: ${conflicts.conflictingDates.join(', ')}`,
                    HTTP_statusCode.InternalServerError
                );
            }

            bookingData.requestedDates = requestedDates;
            await bookingData.save();

            return bookingData;

        } catch (error) {
            console.error('Error in isBookingAccepted:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to check BookingAccepted.', HTTP_statusCode.InternalServerError);
        }
    }

    makeBookingPayment = async (
        companyName: string,
        amount: string,
        bookingData: any
    ): Promise<Stripe.Checkout.Session> => {
        try {
            const result: Stripe.Checkout.Session = await this.paymentService.makeThePayment(companyName, amount, bookingData)
            if (result) {
                return result
            }
            throw new CustomError('Failed to make the payment.', HTTP_statusCode.InternalServerError);

        } catch (error) {
            console.error('Error in makeBookingPayment:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to make payment.', HTTP_statusCode.InternalServerError);
        }
    }

    confirmPayment = async (bookingId: string, amountPaid: string, paymentId: string): Promise<BookingInterface> => {
        try {
            const bookingRequest = await this.bookingRepository.getById(bookingId)
            if (!bookingRequest) {
                throw new CustomError('Booking request not found', HTTP_statusCode.NotFound);
            }

            const vendor = await this.vendorRepository.getById(bookingRequest.vendor_id.toString());

            if (!vendor) {
                throw new CustomError('Vendor not found', HTTP_statusCode.NotFound);
            }

            const { finalAmount, finalPaymentDue } =
                this.calculatePaymentSchedule(bookingRequest.startingDate,
                    bookingRequest.noOfDays,
                    bookingRequest.totalPrice
                );

            const requestedDates = this.calculateBookingDates(
                bookingRequest.startingDate,
                bookingRequest.noOfDays
            );

            const conflicts = this.checkDateConflicts(requestedDates, vendor.bookedDates);
            if (conflicts.hasConflict) {
                throw new CustomError(
                    `Booking dates are no longer available: ${conflicts.conflictingDates.join(', ')}`,
                    HTTP_statusCode.InternalServerError
                );
            }

            const bookingData: Partial<BookingInterface> = {
                userId: bookingRequest.user_id,
                vendorId: bookingRequest.vendor_id,
                bookingId: bookingRequest.bookingReqId,
                clientName: bookingRequest.name,
                email: bookingRequest.email,
                phone: bookingRequest.phone,
                venue: bookingRequest.venue,
                serviceType: bookingRequest.serviceType,
                packageId: bookingRequest.packageId,
                customizations: bookingRequest.customizations,
                startingDate: bookingRequest.startingDate,
                noOfDays: bookingRequest.noOfDays,
                totalAmount: bookingRequest.totalPrice,
                advancePayment: {
                    amount: parseInt(amountPaid),
                    status: PaymentStatus.Completed,
                    paymentId: paymentId,
                    paidAt: new Date(),
                },
                finalPayment: {
                    amount: finalAmount,
                    dueDate: finalPaymentDue,
                    status: PaymentStatus.Pending,
                },
                bookingStatus: BookingStatus.Confirmed,
                requestedDates,
            };

            const [savedBooking, updated] = await Promise.all([
                this.bookingRepo.saveBooking(bookingData),
                this.bookingRepository.acceptUpdate(vendor._id.toString(), requestedDates),
            ]);

            if (!updated) {
                throw new CustomError('Failed to update vendor availability', HTTP_statusCode.InternalServerError);
            }

            await this.bookingRepository.deleteBookingRequest(bookingId);

            this.scheduleReminderEmail(
                savedBooking,
                new Date(savedBooking.startingDate),
                'event'
            );
            this.scheduleReminderEmail(
                savedBooking,
                new Date(savedBooking.finalPayment.dueDate),
                'finalPayment'
            );
            return savedBooking;

        } catch (error) {
            console.error('Error in confirming Payment:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to confirm payment.', HTTP_statusCode.InternalServerError);
        }
    }


    private scheduleReminderEmail(
        booking: any,
        reminderDate: Date,
        type: 'finalPayment' | 'event'
    ) {
        const job = cron.schedule('0 0 * * *', async () => {
            const currentDate = new Date();
            if (currentDate.toDateString() === reminderDate.toDateString()) {
                const reminderTypeText =
                    type === 'event'
                        ? `Your booking for ${booking.startingDate} is coming up!`
                        : `Your ${type} is due on ${reminderDate.toDateString()}.`;

                await sendEmail(
                    booking.email,
                    'New Booking Request - CaptureCrew',
                    emailTemplates.vendorAccepted(reminderTypeText)
                );
                job.stop();
            }
        });
    }

    makeMFPayments = async(paymentData: PaymentData): Promise<Stripe.Checkout.Session> =>{
        try {

            if (!paymentData || !paymentData.sbooking || !paymentData.paymentType) {
                throw new CustomError('Invalid payment data received.', HTTP_statusCode.InternalServerError);
            }

            const booking = await this.bookingRepo.getById(paymentData.sbooking._id);

            if (!booking) {
                throw new CustomError('Booking not found.', HTTP_statusCode.NotFound);
            }

            if (booking.bookingStatus !== 'confirmed') {
                throw new CustomError('Booking is not confirmed or not active.', HTTP_statusCode.InternalServerError);
            }

            if (paymentData.paymentType === 'finalAmount') {
                if (booking.advancePayment?.status === 'pending') {
                    throw new CustomError('Advance payment must be completed before final payment.', HTTP_statusCode.InternalServerError);
                }
                if (booking.finalPayment?.status === 'completed') {
                    throw new CustomError('Final payment has already been made.', HTTP_statusCode.InternalServerError);
                }
            } else {
                throw new CustomError('Invalid payment type.', HTTP_statusCode.InternalServerError);
            }

            const amount = paymentData.sbooking.finalPayment?.amount;
            if (!amount) {
                throw new CustomError('Invalid payment data: missing amount.', HTTP_statusCode.InternalServerError);
            }

            return await this.paymentService.makeMFPayment(amount, paymentData);

        } catch (error) {
            console.error('Error in makeBooking mid/final Payment:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to make payment.', HTTP_statusCode.InternalServerError);
        }
    }

    confirmMFPayment = async(
        bookingcId: string,
        amountPaid: number,
        paymentcId: string,
        paymentType: string
    ): Promise<{ success: boolean, booking: BookingInterface }> =>{
        try {
            if (paymentType !== 'finalAmount') {
                throw new Error('Invalid payment type');
            }
            const updatedBooking = await this.bookingRepo.updatePayment(
                bookingcId,
                amountPaid,
                paymentcId,
                paymentType
            );


            const [user, vendor] = await Promise.all([
                this.userRepository.getById(updatedBooking.userId.toString()),
                this.vendorRepository.getById(updatedBooking.vendorId.toString())
            ])


            if (!vendor) {
                throw new CustomError('Vendor not found', HTTP_statusCode.InternalServerError)
            }

            if (!user) {
                throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.InternalServerError)
            }
            const emailPromises = [
                sendEmail(
                    [updatedBooking.email, user.email],
                    'Payment Confirmation - CaptureCrew',
                    emailTemplates.paymentConfirmation(updatedBooking, paymentType)
                ),
                sendEmail(
                    vendor.email,
                    'Payment Received - CaptureCrew',
                    emailTemplates.vendorPaymentNotification(updatedBooking, paymentType)
                ),
            ];
            await Promise.all(emailPromises);

            return {
                success: true,
                booking: updatedBooking
            };


        } catch (error) {
            console.error('Error in confirming MFPayment:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to confirmmf payment.', HTTP_statusCode.InternalServerError);
        }
    }

    cancelBooking = async (bookingId: string, cancellationReason?: string): Promise<CancelBookingResult> => {
        try {
            const booking = await this.bookingRepo.findBooking(bookingId)
            if (!booking) {
                throw new Error('Booking not found');
            }
            const cancellationPolicy = new BookingCancellationPolicyImpl();
            const refundEligibility = cancellationPolicy.calculateRefundEligibility(booking);

            if (!refundEligibility.isEligible) {
                throw new CustomError(
                    refundEligibility.reason || 'Cancellation not permitted',
                    HTTP_statusCode.InternalServerError
                );
            }

            const userRefundAmount =
                booking.advancePayment.amount * (refundEligibility.userRefundPercentage / 100);
            const vendorAmount =
                booking.advancePayment.amount * (refundEligibility.vendorFeePercentage / 100);

            try {
                const refundResult: RefundResult = await this.paymentService.processRefund(booking);
                if (!refundResult.success) throw new CustomError('Refund failed', HTTP_statusCode.InternalServerError);

                const userTransaction = {
                    amount: userRefundAmount,
                    transactionType: TransactionType.Credit,
                    paymentType: PaymentType.Refund,
                    paymentMethod: PaymentMethod.STRIPE,
                    paymentId: refundResult.refundId,
                    description: `Refund for booking ${booking.bookingId}`,
                    bookingId: booking.bookingId,
                    status: PaymentStatus.Completed
                }

                await userModel.findByIdAndUpdate(
                    booking.userId,
                    {
                        $inc: { walletBalance: userRefundAmount },
                        $push: { transactions: userTransaction }
                    }
                );

                const vendorTransaction = {
                    amount: vendorAmount,
                    transactionType: TransactionType.Credit,
                    paymentType: PaymentType.Cancellation,
                    paymentMethod: PaymentMethod.STRIPE,
                    paymentId: refundResult.refundId,
                    description: `Cancellation fee for booking ${booking.bookingId}`,
                    bookingId: booking.bookingId,
                    status: 'success'
                };
                await vendorModel.findByIdAndUpdate(
                    booking.vendorId,
                    {
                        $inc: { walletBalance: vendorAmount },
                        $push: { transactions: vendorTransaction }
                    }
                );

                // Update booking status
                await bookingModel.findByIdAndUpdate(
                    booking._id,
                    {
                        bookingStatus: BookingStatus.Cancelled,
                        'advancePayment.status': PaymentStatus.Refund,
                        'advancePayment.refundedAt': new Date(),
                        cancellationReason: cancellationReason,
                        cancelledAt: new Date()
                    }
                );

                const dateToRemove = this.calculateBookingDates(
                    booking.startingDate,
                    booking.noOfDays
                );

                await vendorModel.findByIdAndUpdate(
                    booking.vendorId,
                    { $pull: { bookedDates: dateToRemove } }
                );

                return { success: true, userRefundAmount, vendorAmount, reason: refundEligibility.reason };


            } catch (error) {
                console.error('Error in refunding :', error);
                if (error instanceof StripeRefundError) {
                    console.error('Stripe Refund Error:', error.message, error.code);

                    if (error.code === 'charge_already_refunded') {
                        throw new CustomError('Refund already processed', HTTP_statusCode.InternalServerError)
                    }
                }
                throw new CustomError('Failed to process refund', HTTP_statusCode.InternalServerError);
            }



        } catch (error) {
            console.error('Error in cancelling booking:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to cancel booking.', HTTP_statusCode.InternalServerError);
        }
    }

    private calculateBookingDates(startingDate: string, noOfDays: number): string[] {
        const dates: string[] = [];
        const [day, month, year] = startingDate.split('/');
        const currentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

        for (let i = 0; i < noOfDays; i++) {
            const dateString = currentDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '/');

            dates.push(dateString);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }

    private checkDateConflicts(requestedDates: string[], bookedDates: string[]): {
        hasConflict: boolean;
        conflictingDates: string[];
    } {
        const bookedDatesSet = new Set(bookedDates);
        const conflictingDates: string[] = [];

        for (const date of requestedDates) {
            if (bookedDatesSet.has(date)) {
                conflictingDates.push(date);
            }
        }

        return {
            hasConflict: conflictingDates.length > 0,
            conflictingDates
        };
    }

    private calculateDueDates(startingDate: string, noOfDays: number) {
        const [day, month, year] = startingDate.split('/').map(Number);
        const eventDate = new Date(year, month - 1, day);

        if (isNaN(eventDate.getTime())) {
            throw new Error("Invalid starting date format");
        }
        const eventEndDate = new Date(eventDate);
        eventEndDate.setDate(eventEndDate.getDate() + noOfDays);

        const advancePaymentDue = new Date();
        advancePaymentDue.setDate(advancePaymentDue.getDate() + 3);

        const minDaysBeforeEvent = 7;
        const daysUntilEvent = Math.floor((eventDate.getTime() - advancePaymentDue.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilEvent < minDaysBeforeEvent) {

            advancePaymentDue.setDate(new Date().getDate() + 1);
        }

        const finalPaymentDue = new Date(eventEndDate);
        finalPaymentDue.setDate(finalPaymentDue.getDate() + 7);

        const formatDate = (date: Date) => {
            date.setUTCHours(0, 0, 0, 0);
            return date;
        };

        return {
            advancePaymentDue: formatDate(advancePaymentDue),
            finalPaymentDue: formatDate(finalPaymentDue),
            eventDate: formatDate(eventDate),
            eventEndDate: formatDate(eventEndDate)
        };
    }

    private calculatePaymentAmounts(totalPrice: number) {
        const advancePercentage = 0.3;
        const advanceAmount = Math.round(totalPrice * advancePercentage);
        return {
            advanceAmount,
            finalAmount: totalPrice - advanceAmount
        };
    }

    private calculatePaymentSchedule(startingDate: string, noOfDays: number, totalPrice: number) {
        const dates = this.calculateDueDates(startingDate, noOfDays);
        const amounts = this.calculatePaymentAmounts(totalPrice);

        return {
            finalAmount: amounts.finalAmount,
            finalPaymentDue: dates.finalPaymentDue
        };
    }


    // private calculateRefundAmounts(booking: BookingDocument) {
    //     const daysSincePayment = Math.floor(
    //         (new Date().getTime() - booking.advancePayment.paidAt.getTime()) / (1000 * 60 * 60 * 24)
    //     )
    //     const advanceAmount = booking.advancePayment.amount;
    //     if (daysSincePayment <= 7) {
    //         return {
    //             userRefundAmount: advanceAmount * 0.95,
    //             vendorAmount: advanceAmount * 0.05
    //         }
    //     } else {
    //         return {
    //             userRefundAmount: advanceAmount * 0.7,
    //             vendorAmount: advanceAmount * 0.3
    //         }
    //     }
    // }



}

export default BookingService