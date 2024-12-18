import { BookingConfirmed } from '@/types/bookingTypes';
import { differenceInDays, parseISO, isValid } from 'date-fns';

export interface BookingCancellationPolicy {
  calculateRefundEligibility(booking: BookingConfirmed): {
    isEligible: boolean;
    userRefundPercentage: number;
    vendorFeePercentage: number;
    daysRemainingBeforeEvent?:  number;
    reason?: string;
  };
}

export class BookingCancellationPolicyImpl implements BookingCancellationPolicy {
  calculateRefundEligibility(booking: BookingConfirmed) {
    if (!booking.advancePayment?.paidAt) {
      return {
        isEligible: false,
        userRefundPercentage: 0,
        vendorFeePercentage: 0,
        daysRemainingBeforeEvent: 0,
        reason: 'Invalid payment information'
      };
    }

    // Safely parse payment date
    const paymentDate = this.parseDate(booking.advancePayment.paidAt);

    // Safely parse event date
    const eventDate = this.parseDate(this.convertToISODate(booking.startingDate));

    // Validate dates
    if (!paymentDate || !eventDate) {
      return {
        isEligible: false,
        userRefundPercentage: 0,
        vendorFeePercentage: 0,
        reason: 'Invalid date information'
      };
    }

    const today = new Date();

    console.log(paymentDate, eventDate, today, 'details');


    // Calculate total days between payment and event
    const totalDaysBetweenPaymentAndEvent = differenceInDays(eventDate, paymentDate);
    console.log(totalDaysBetweenPaymentAndEvent, 'totalDaysBetweenPaymentAndEvent');


    // Calculate days remaining before event
    const daysRemainingBeforeEvent = differenceInDays(eventDate, today);
    console.log(daysRemainingBeforeEvent, 'daysRemainingBeforeEvent');

    // Calculate percentage of time elapsed
    const timeElapsedPercentage =
      ((totalDaysBetweenPaymentAndEvent - daysRemainingBeforeEvent) / totalDaysBetweenPaymentAndEvent) * 100;
    console.log(timeElapsedPercentage, 'timeElapsedPercentage');


    // Determine refund eligibility and percentages
    if (daysRemainingBeforeEvent < 0) {
      // Event has already passed
      return {
        isEligible: false,
        userRefundPercentage: 0,
        vendorFeePercentage: 0,
        daysRemainingBeforeEvent,
        reason: 'Event has already occurred'
      };
    }

    if (timeElapsedPercentage <= 10) {
      // Within first 10% of time - full refund to user
      return {
        isEligible: true,
        userRefundPercentage: 95,
        vendorFeePercentage: 5,
        daysRemainingBeforeEvent,
        reason: 'Early cancellation'
      };
    }

    if (timeElapsedPercentage <= 60) {
      // Between 10% and 60% of time - partial refund
      return {
        isEligible: true,
        userRefundPercentage: 70,
        vendorFeePercentage: 30,
        daysRemainingBeforeEvent,
        reason: 'Partial refund period'
      };
    }

    // Beyond 60% of time - no refund
    return {
      isEligible: false,
      userRefundPercentage: 0,
      vendorFeePercentage: 0,
      daysRemainingBeforeEvent,
      reason: 'Cancellation not permitted - too close to event'
    };
  }

  // Helper method to convert DD/MM/YYYY to ISO date format
  private convertToISODate(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  private parseDate(dateInput: string): Date | null {
    try {
      const parsedDate = parseISO(dateInput);
      return isValid(parsedDate) ? parsedDate : null;
    } catch (error) {
      console.log(error);

      console.error('Invalid date:', dateInput);
      return null;
    }
  }
}