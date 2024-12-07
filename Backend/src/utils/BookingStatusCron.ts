import cron from 'node-cron';
import bookingRequestModel, { BookingAcceptanceStatus } from '../models/bookingRequestModel';
import { sendEmail } from './sendEmail';
import { emailTemplates } from './emailTemplates';
import bookingRepository from '../repositories/bookingRepository';


export class BookingStatusCron{
    private static CRON_SCHEDULE = '30 10 * * *';

    static async initializeCronJobs(){
        cron.schedule(this.CRON_SCHEDULE, async() => {
            try {
                await this.checkOverduePayments();
            } catch (error) {
                console.error('Error in payment status cron job:', error);
            }
        });
        console.log('Booking status cron jobs initialized');
    }

    private static async checkOverduePayments(){
        try {
            const overdueBookings = await bookingRepository.overdueBookings()

            console.log(overdueBookings,'overduebooingsssssss');
            
            for (const booking of overdueBookings){
                await this.processOverdueBooking(booking);
            }
        } catch (error) {
            console.error('Error processing overdue bookings:', error);
            throw error;
        }
    }

    private static async processOverdueBooking(booking: any){
        try {
            booking.bookingStatus = BookingAcceptanceStatus.PaymentOverdue;
            booking.advancePayment.status = 'overdue'
            console.log(booking,'bookingssssssssss');
            
            // if (booking.requestedDates) {
            //     await bookingRepository.rollbackVendorDates(
            //         booking.vendorId, 
            //         booking.requestedDates
            //     );
            // }

            await sendEmail(
                booking.email,
                'Booking Cancelled - Payment Overdue - CaptureCrew',
                emailTemplates.bookingCancelledPaymentOverdue(booking.name, {
                    serviceType: booking.serviceType,
                    venue: booking.venue,
                    startingDate: booking.startingDate,
                    bookingReqId: booking.bookingReqId,
                    advanceAmount: booking.advancePayment.amount,
                    dueDate: booking.advancePaymentDueDate.toLocaleDateString()
                })
            );

            await sendEmail(
                booking.vendor_id.email,
                'Booking Cancelled - Client Payment Overdue - CaptureCrew',
                emailTemplates.vendorBookingCancelledPaymentOverdue({
                    bookingId: booking.bookingReqId,
                    clientName: booking.name,
                    startingDate: booking.startingDate,
                    venue: booking.venue
                })
            );

            await booking.save();
            console.log(`Successfully processed overdue booking: ${booking.bookingReqId}`);

        } catch (error) {
            console.error(`Error processing overdue booking ${booking.bookingReqId}:`, error);
            throw error;            
        }
    }

}