
import { CustomError, StripeRefundError } from '../error/customError';
import userRepository from '../repositories/userRepository';
import bookingRepository from '../repositories/bookingRepository';
import bookingRequestModel, { BookingAcceptanceStatus, BookingInterface } from '../models/bookingRequestModel';
import vendorRepository from '../repositories/vendorRepository';
import { v4 as uuidv4 } from 'uuid';
import packageRepository from '../repositories/packageRepository';
import mongoose from 'mongoose';
import { sendEmail } from '../utils/sendEmail';
import { emailTemplates } from '../utils/emailTemplates';
import paymentService from './paymentService';
import bookingModel, { BookingDocument, BookingStatus, PaymentStatus } from '../models/bookingModel';
import cron from 'node-cron';
import bookingRepo from '../repositories/bookingRepo';
import { PaymentMethod, PaymentType, TransactionType } from '../utils/extraUtils';
import userModel from '../models/userModel';
import vendorModel from '../models/vendorModel';
import { BookingCancellationPolicyImpl } from '../utils/bookingPolicyService';

class BookingService {
    async newBookingReq(
        bookingData: Partial<BookingInterface>,
        vendorId: string,
        userId: string
    ) {
        try {
            const user = await userRepository.getById(userId)
            if (!user) {
                throw new CustomError('No user found', 400)
            }
            const vendor = await vendorRepository.getById(vendorId);
            if (!vendor) {
                throw new CustomError('No Vendor found', 404)
            }
            if (bookingData.startingDate) {
                const slotAvailabilty = await bookingRepository.checkIsAvailable(bookingData.startingDate, vendorId);

                if (slotAvailabilty === true) {

                    if (!bookingData.packageId) {
                        throw new CustomError('Package ID is required', 400);
                    }
                    const pkgGot = typeof bookingData.packageId === 'string'
                        ? new mongoose.Types.ObjectId(bookingData.packageId)
                        : bookingData.packageId;

                    const pkgamt = await packageRepository.getById(pkgGot.toString());


                    if (!pkgamt || typeof pkgamt.price !== 'number') {
                        throw new CustomError('Invalid package or package price not found', 400);
                    }

                    const noOfDays = Number(bookingData.noOfDays);
                    if (isNaN(noOfDays) || noOfDays <= 0) {
                        throw new CustomError('Invalid number of days', 400);
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
                        throw new CustomError('Price mismatch in calculations', 400);
                    }

                    const createBookingReq = await bookingRepository.saveBookingReq(
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
                        bookingData.totalPrice || totalPrice, // This will now work with both string and ObjectId
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
                    }

                    if (createBookingReq !== null) {
                        return { success: true, reqSend: true }
                    } else {
                        return { success: false, reqSend: false }
                    }
                }
            }
        } catch (error) {
            console.error('Error in newBookingReq:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to create new Booking Request.', 500);
        }
    }

    async getBookingRequests(userId: string) {
        try {

            const [result, confirmed] = await Promise.all([
                bookingRepository.findBookingRequests(userId),
                bookingRepo.findBookingConfirmedReqs(userId)
            ]);
            // const result = await bookingRepository.findBookingRequests(userId);
            // const confirmed = await bookingRepo.findBookingConfirmedReqs(userId)

            if (result !== null) {
                return { success: true, bookingRequest: result, bookingConfirmed: confirmed }
            } else {
                return { success: false }
            }

        } catch (error) {
            console.error('Error in findBookingRequsts:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to find Booking Requests.', 500);
        }
    }

    async bookingReqsVendor(vendorId: string) {
        try {
            const [result, confirmed] = await Promise.all([
                bookingRepository.getBookingReqsVendor(vendorId),
                bookingRepo.findBookingConfirmedReqsV(vendorId)
            ]);
            // const result = await bookingRepository.getBookingReqsVendor(vendorId);
            // const confirmed = await bookingRepo.findBookingConfirmedReqsV(vendorId);

            if (result && result.length > 0) {
                return { success: true, bookingRequest: result, bookingConfirmed: confirmed };
            } else {
                return { success: false, bookingRequest: [] };
            }
        } catch (error) {
            console.error('Error in bookingReqsVendor:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to find Booking Requests.', 500);
        }
    }

    async revokeRequest(bookingId: string, userId: string) {
        try {
            const booking = await bookingRequestModel.findOne({
                _id: bookingId,
                user_id: userId
            })
            if (!booking) {
                throw new CustomError('Booking not Found', 404)
            }
            if (booking.bookingStatus !== BookingAcceptanceStatus.Requested) {
                throw new CustomError(`Cannot revoke booking. Current status: ${booking.bookingStatus}`, 400)
            }
            const deleteReq = await bookingRepository.deleteReq(bookingId, userId)

            return deleteReq
        } catch (error) {
            console.error('Error in revokeRequest:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to delete Booking Requests.', 500);
        }
    }

    async acceptRejectReq(bookingId: string, vendorId: string, action: string, rejectionReason?: string): Promise<void> {
        try {

            const [bookingReq, vendor] = await Promise.all([
                bookingRepository.getById(bookingId),
                vendorRepository.getById(vendorId)
            ]);

            if (!bookingReq) {
                throw new CustomError('No booking Request for this Id', 404)
            }
            if (!vendor) {
                throw new CustomError('Vendor not found', 404);
            }
            if (bookingReq.bookingStatus !== 'requested') {
                throw new CustomError('Booking has already been processed', 400);
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
                        400
                    );
                }

                const dueDates = this.calculateDueDates(bookingReq.startingDate, bookingReq.noOfDays);

                const today = new Date();
                const daysTillEvent = Math.floor((dueDates.eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                if (daysTillEvent < 5) {
                    throw new CustomError(
                        'Booking cannot be accepted. Event date must be at least 5 days from today.',
                        400
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
            const updatedBooking = await bookingRepository.update(bookingId, bookingReq);

            if (!updatedBooking) {
                const requestedDates = this.calculateBookingDates(
                    bookingReq.startingDate,
                    bookingReq.noOfDays
                );
                if (action === 'accept') {
                    await bookingRepository.rollbackVendorDates(vendorId, requestedDates);
                }
                throw new CustomError('Failed to update booking status', 500);
            }

        } catch (error) {
            console.error("Error in acceptRejectReq", error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to acceptRejectReq', 500)
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

    async fetchAllBookings() {
        try {
            const bookings = await bookingRepo.getAllBookings()
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
            throw new CustomError('Failed to fetchAllBookings.', 500);
        }
    }

    async isBookingAccepted(
        userId: string,
        vendorId: string,
        bookingId: string
    ): Promise<BookingInterface | null> {
        try {

            const [bookingData, vendor] = await Promise.all([
                bookingRequestModel.findOne({
                    user_id: userId,
                    vendor_id: vendorId,
                    _id: bookingId
                }),
                vendorRepository.getById(vendorId)
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
                    400
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
            throw new CustomError('Failed to check BookingAccepted.', 500);
        }
    }

    async makeBookingPayment(
        companyName: string,
        amount: string,
        bookingData: any
    ) {
        try {

            const result = await paymentService.makeThePayment(companyName, amount, bookingData)
            if (result) {
                return result
            } else {
                throw new CustomError('Failed to make the payment.', 400);
            }
        } catch (error) {
            console.error('Error in makeBookingPayment:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to make payment.', 500);
        }
    }

    async confirmPayment(bookingId: string, amountPaid: string, paymentId: string) {
        // const session = await mongoose.startSession();
        // console.log(session,'session created moongose');

        // session.startTransaction();
        try {
            const bookingRequest = await bookingRequestModel.findById(bookingId);
            if (!bookingRequest) {
                throw new CustomError('Booking request not found', 404);
            }

            const vendor = await vendorRepository.getById(bookingRequest.vendor_id.toString());

            if (!vendor) {
                throw new CustomError('Vendor not found', 404);
            }

            const { finalAmount, finalPaymentDue } =
                this.calculatePaymentSchedule(bookingRequest.startingDate,
                    bookingRequest.noOfDays,
                    bookingRequest.totalPrice);

            const requestedDates = this.calculateBookingDates(
                bookingRequest.startingDate,
                bookingRequest.noOfDays
            );

            const conflicts = this.checkDateConflicts(requestedDates, vendor.bookedDates);
            if (conflicts.hasConflict) {
                throw new CustomError(
                    `Booking dates are no longer available: ${conflicts.conflictingDates.join(', ')}`,
                    400
                );
            }

            const confirmedBooking = new bookingModel({
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
                    paidAt: new Date()
                },
                finalPayment: {
                    amount: finalAmount,
                    dueDate: finalPaymentDue,
                    status: PaymentStatus.Pending
                },
                bookingStatus: BookingStatus.Confirmed,
                requestedDates: requestedDates
            });

            const savedBooking = await confirmedBooking.save();

            const updated = await bookingRepository.acceptUpdate(vendor._id.toString(), requestedDates);

            if (!updated) {
                throw new CustomError('Failed to update vendor availability', 500);
            }

            await bookingRequestModel.findByIdAndDelete(bookingId);

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

            // await session.commitTransaction();
            return savedBooking;

        } catch (error) {
            console.error('Error in confirming Payment:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to confirm payment.', 500);
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

    async makeMFPayments(
        paymentData: any
    ) {
        try {
            console.log(paymentData, 'payment dat in the service got');

            if (!paymentData || !paymentData.sbooking || !paymentData.paymentType) {
                throw new CustomError('Invalid payment data received.', 400);
            }

            const booking = await bookingRepo.getById(paymentData.sbooking._id);
            console.log(booking, 'bookings got for hta id');

            if (!booking) {
                throw new CustomError('Booking not found.', 404);
            }

            if (booking.bookingStatus !== 'confirmed') {
                throw new CustomError('Booking is not confirmed or not active.', 400);
            }

            let amount
            if (paymentData.paymentType === 'finalAmount') {

                if (booking.advancePayment?.status == 'pending') {
                    throw new CustomError('Advance payment must be completed before Final payment.', 400);
                }
                if (booking.finalPayment?.status == 'completed') {
                    throw new CustomError('Final payment has already been made.', 400);
                }
                amount = paymentData.sbooking?.finalPayment?.amount;

            } else {
                throw new CustomError('Invalid payment type.', 400);
            }

            if (!amount) {
                throw new CustomError('Invalid payment type or missing payment data.', 400);
            }

            const result = await paymentService.makeMFPayment(amount, paymentData)

            if (result) {
                return result
            } else {
                throw new CustomError('Failed to make the payment.', 400);
            }
        } catch (error) {
            console.error('Error in makeBooking mid/final Payment:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to make payment.', 500);
        }
    }

    async confirmMFPayment(bookingcId: string, amountPaid: number, paymentcId: string, paymentType: string) {
        try {
            if (paymentType !== 'finalAmount') {
                throw new Error('Invalid payment type');
            }
            const updatedBooking = await bookingRepo.updatePayment(
                bookingcId,
                amountPaid,
                paymentcId,
                paymentType
            );

            const vendor = await vendorRepository.getById(updatedBooking.vendorId.toString())
            if (!vendor) {
                throw new CustomError('Vnedor not found', 400)
            }

            const user = await userRepository.getById(updatedBooking.userId.toString())
            if (!user) {
                throw new CustomError('User not found', 400)
            }

            await sendEmail(
                [updatedBooking.email, user.email],
                'Payment Confirmation - CaptureCrew',
                emailTemplates.paymentConfirmation(updatedBooking, paymentType)
            );

            await sendEmail(
                vendor.email,
                'Payment Received - CaptureCrew',
                emailTemplates.vendorPaymentNotification(updatedBooking, paymentType)
            );

            return {
                success: true,
                booking: updatedBooking
            };


        } catch (error) {
            console.error('Error in confirming MFPayment:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to confirmmf payment.', 500);
        }
    }

    async cancelBooking(bookingId: string, cancellationReason?: string) {
        try {
            console.log(bookingId, 'iddd');

            const booking = await bookingRepo.findBooking(bookingId)
            console.log(booking, 'findeed booking to cancele in service');
            if (!booking) {
                throw new Error('Booking not found');
            }
            const cancellationPolicy = new BookingCancellationPolicyImpl();
            const refundEligibility = cancellationPolicy.calculateRefundEligibility(booking);
            console.log(refundEligibility, 'refundeligibility response');


            if (!refundEligibility.isEligible) {
                throw new CustomError(
                    refundEligibility.reason || 'Cancellation not permitted',
                    400
                );
            }

            const userRefundAmount =
                booking.advancePayment.amount * (refundEligibility.userRefundPercentage / 100);
            const vendorAmount =
                booking.advancePayment.amount * (refundEligibility.vendorFeePercentage / 100);

            console.log(userRefundAmount, vendorAmount, 'userRefundAmount vendorAmount');


            try {
                const refundResult = await paymentService.processRefund(booking);
                if (!refundResult.success) {
                    throw new Error('Refund failed');
                }
                console.log(refundResult, 'refundResult ');

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
                console.log(userTransaction, 'userTransaction');


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
                console.log(vendorTransaction, 'vendorTransaction');
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
                console.log(dateToRemove, 'dateToRemove');

                await vendorModel.findByIdAndUpdate(
                    booking.vendorId,
                    { $pull: { bookedDates: dateToRemove } }
                );

                return { success: true, userRefundAmount, vendorAmount, reason: refundEligibility.reason };


            } catch (error) {
                console.error('Error in refunding :', error);
                if (error instanceof StripeRefundError) {
                    console.error('Stripe Refund Error:', error.message, error.code);
                
                    // Check for specific Stripe error codes
                    if (error.code === 'charge_already_refunded') {
                        throw new CustomError('Refund already processed', 400)
                    }
                }
                throw new CustomError('Failed to process refund', 500);
            }



        } catch (error) {
            console.error('Error in cancelling booking:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to cancel booking.', 500);
        }
    }

    private calculateRefundAmounts(booking: BookingDocument) {
        const daysSincePayment = Math.floor(
            (new Date().getTime() - booking.advancePayment.paidAt.getTime()) / (1000 * 60 * 60 * 24)
        )
        const advanceAmount = booking.advancePayment.amount;
        if (daysSincePayment <= 7) {
            return {
                userRefundAmount: advanceAmount * 0.95,
                vendorAmount: advanceAmount * 0.05
            }
        } else {
            return {
                userRefundAmount: advanceAmount * 0.7,
                vendorAmount: advanceAmount * 0.3
            }
        }
    }



}

export default new BookingService()