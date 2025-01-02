import cron from 'node-cron';
import { sendEmail } from './sendEmail';
import { emailTemplates } from './emailTemplates';
import { BookingAcceptanceStatus } from '../enums/commonEnums';
import { IBookingReqRepository } from '../interfaces/repositoryInterfaces/bookingReq.Repository.Interface';


class BookingStatusCron  {

    private bookingRepository: IBookingReqRepository;
    constructor(
        bookingRepository: IBookingReqRepository,
    ) {
        this.bookingRepository = bookingRepository
    }
    private static CRON_SCHEDULE = '30 10 * * *';

    static async initializeCronJobs(bookingRepository: IBookingReqRepository){
        cron.schedule(this.CRON_SCHEDULE, async() => {
            const cronInstance = new BookingStatusCron(bookingRepository);
            try {
                await cronInstance.checkOverduePayments();
            } catch (error) {
                console.error('Error in payment status cron job:', error);
            }
        });
        
    }

    private async checkOverduePayments(){
        try {
            const overdueBookings = await this.bookingRepository.overdueBookings()

            
            for (const booking of overdueBookings){
                await this.processOverdueBooking(booking);
            }
        } catch (error) {
            console.error('Error processing overdue bookings:', error);
            throw error;
        }
    }

    private async processOverdueBooking(booking: any){
        try {
            booking.bookingStatus = BookingAcceptanceStatus.PaymentOverdue;
            booking.advancePayment.status = 'overdue'
            
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

        } catch (error) {
            console.error(`Error processing overdue booking ${booking.bookingReqId}:`, error);
            throw error;            
        }
    }

}

export default BookingStatusCron