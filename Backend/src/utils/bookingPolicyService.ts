import { differenceInDays, parseISO } from 'date-fns';
import { BookingDocument } from '../models/bookingModel';

export interface BookingCancellationPolicy {
  calculateRefundEligibility(booking: BookingDocument): {
    isEligible: boolean;
    userRefundPercentage: number;
    vendorFeePercentage: number;
    reason?: string;
  };
}

export class BookingCancellationPolicyImpl implements BookingCancellationPolicy {
  calculateRefundEligibility(booking: BookingDocument) {

    const paymentDate = booking.advancePayment.paidAt;
    const eventDate = parseISO(this.convertToISODate(booking.startingDate));
    const today = new Date();
    console.log(paymentDate,eventDate,today,'details');

    const totalDaysBetweenPaymentAndEvent = differenceInDays(eventDate, paymentDate);
    console.log(totalDaysBetweenPaymentAndEvent,'totalDaysBetweenPaymentAndEvent');
    
    const daysRemainingBeforeEvent = differenceInDays(eventDate, today);
    console.log(daysRemainingBeforeEvent,'daysRemainingBeforeEvent');

    const timeElapsedPercentage = 
      ((totalDaysBetweenPaymentAndEvent - daysRemainingBeforeEvent) / totalDaysBetweenPaymentAndEvent) * 100;
      console.log(timeElapsedPercentage, 'timeElapsedPercentage');
      

    if (daysRemainingBeforeEvent < 0) {
      return {
        isEligible: false,
        userRefundPercentage: 0,
        vendorFeePercentage: 0,
        reason: 'Event has already occurred'
      };
    }

    if (timeElapsedPercentage <= 10) {
      return {
        isEligible: true,
        userRefundPercentage: 95,
        vendorFeePercentage: 5,
        reason: 'Early cancellation'
      };
    }

    if (timeElapsedPercentage <= 60) {
      return {
        isEligible: true,
        userRefundPercentage: 70,
        vendorFeePercentage: 30,
        reason: 'Partial refund period'
      };
    }

    return {
      isEligible: false,
      userRefundPercentage: 0,
      vendorFeePercentage: 0,
      reason: 'Cancellation not permitted - too close to event'
    };
  }

  private convertToISODate(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
}