
import { CustomError } from '../error/customError';
import userRepository from '../repositories/userRepository';
import bookingRepository from '../repositories/bookingRepository';
import { BookingAcceptanceStatus, BookingInterface } from '../models/bookingRequestModel';
import vendorRepository from '../repositories/vendorRepository';
import { v4 as uuidv4 } from 'uuid';
import packageRepository from '../repositories/packageRepository';
import mongoose from 'mongoose';
import { sendEmail } from '../utils/sendEmail';
import { emailTemplates } from '../utils/emailTemplates';
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
                console.log(slotAvailabilty, 'slotavailabilty');

                if (slotAvailabilty === true) {

                    if (!bookingData.packageId) {
                        throw new CustomError('Package ID is required', 400);
                    }
                    const pkgGot = typeof bookingData.packageId === 'string'
                        ? new mongoose.Types.ObjectId(bookingData.packageId)
                        : bookingData.packageId;

                    const pkgamt = await packageRepository.getById(pkgGot.toString());

                    console.log(pkgamt, 'pkgggggggggggggggggggggggggg');

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

                    console.log(totalPrice, 'total price chack passed');
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
                    console.log(createBookingReq, 'created new bookng req .................');

                    if (createBookingReq && vendor.email) {
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
            const result = await bookingRepository.findBookingRequests(userId);

            if (result !== null) {
                return { success: true, bookingRequest: result }
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
            const result = await bookingRepository.getBookingReqsVendor(vendorId);

            if (result && result.length > 0) {
                // Add additional logging for debugging
                // console.log(`Found ${result.length} booking requests for vendor ${vendorId}`);
                return { success: true, bookingRequest: result };
            } else {
                // console.log(`No booking requests found for vendor ${vendorId}`);
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
            const deleteReq = await bookingRepository.deleteReq(bookingId, userId)
            console.log(deleteReq, 'dell');

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

                // Check for conflicts with vendor's booked dates
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

                if (daysTillEvent < 7) {
                    throw new CustomError(
                        'Booking cannot be accepted. Event date must be at least 7 days from today.',
                        400
                    );
                }

                const { advanceAmount, midAmount, finalAmount } = this.calculatePaymentAmounts(bookingReq.totalPrice);

                bookingReq.advancePaymentDueDate = dueDates.advancePaymentDue;
                bookingReq.advancePayment = {
                    amount: advanceAmount,
                    status: 'pending'
                };

                const updated = await bookingRepository.acceptUpdate(vendorId, requestedDates);
                console.log(updated, 'upadted dates also while accept');

                if (!updated) {
                    throw new CustomError('Failed to update vendor availability', 500);
                }

                await sendEmail(
                    bookingReq.email ,
                    'Booking Confirmed - CaptureCrew',
                    emailTemplates.bookingAccepted(bookingReq.name, {
                        serviceType: bookingReq.serviceType,
                        venue: bookingReq.venue,
                        startingDate: bookingReq.startingDate,
                        noOfDays: bookingReq.noOfDays,
                        totalPrice: bookingReq.totalPrice,
                        advanceAmount: advanceAmount,
                        midAmount: midAmount,
                        finalAmount: finalAmount,
                        advancePaymentDueDate: dueDates.advancePaymentDue.toLocaleDateString(),
                        midPaymentDueDate: dueDates.midPaymentDue.toLocaleDateString(),
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
                    bookingReq.email ,
                    'Booking Request Update - CaptureCrew',
                    emailTemplates.bookingRejected(bookingReq.name,bookingReq?.rejectionReason,{
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
            console.log(updatedBooking, 'res after accept/reject');
            if (!updatedBooking) {
                const requestedDates = this.calculateBookingDates(
                    bookingReq.startingDate,
                    bookingReq.noOfDays
                );
                // If booking update fails after updating vendor dates, we should handle this case
                if (action === 'accept') {
                    // Rollback vendor dates update
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
        // Convert booked dates to a Set for O(1) lookup
        const bookedDatesSet = new Set(bookedDates);
        const conflictingDates: string[] = [];

        // Check each requested date for conflicts
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
        // const eventDate = new Date(startingDate);
        if (isNaN(eventDate.getTime())) {
            throw new Error("Invalid starting date format");
        }
        const eventEndDate = new Date(eventDate);
        eventEndDate.setDate(eventEndDate.getDate() + noOfDays);

        // Advance payment due 3 days from booking acceptance
        const advancePaymentDue = new Date();
        advancePaymentDue.setDate(advancePaymentDue.getDate() + 3);

        const minDaysBeforeEvent = 7; // Minimum 10 days before event
        const daysUntilEvent = Math.floor((eventDate.getTime() - advancePaymentDue.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilEvent < minDaysBeforeEvent) {
            // If event is too close, set due date to next day
            advancePaymentDue.setDate(new Date().getDate() + 1);
        }

        // Mid payment due 2 days before event
        const midPaymentDue = new Date(eventDate);
        midPaymentDue.setDate(midPaymentDue.getDate() - 2);

        // Final payment due 7 days after event completion
        const finalPaymentDue = new Date(eventEndDate);
        finalPaymentDue.setDate(finalPaymentDue.getDate() + 7);

        const formatDate = (date: Date) => {
            date.setUTCHours(0, 0, 0, 0);
            return date;
        };

        return {
            advancePaymentDue: formatDate(advancePaymentDue),
            midPaymentDue: formatDate(midPaymentDue),
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
            midAmount: advanceAmount,
            finalAmount: totalPrice - (2 * advanceAmount)
        };
    }


    async fetchAllBookings(){
        try {
            const bookings = await bookingRepository.getAllBookings()
            if(bookings && bookings.length > 0){
                return { success: true, bookingRequest: bookings };
            } else {
                return { success: false, bookingRequest: [] };
            }
        } catch (error) {
            console.error('Error in fetchAllBookings:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to fetchAllBookings.', 500);
        }
    }

}

export default new BookingService()