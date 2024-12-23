import Stripe from "stripe";
import { BookingReqDocument } from "../../models/bookingRequestModel";
import { BookingInterface, BookingReqInterface, BookingVendorResponse, CancelBookingResult, PaymentData } from "../commonInterfaces";

export interface IBookingService {
    getBookingRequests(userId: string) : Promise<{
        success: boolean, 
        bookingRequest?: BookingReqInterface[] | null , 
        bookingConfirmed?: BookingInterface[] | null
    }>;
    newBookingReq(bookingData: Partial<BookingReqInterface>, vendorId: string, userId: string): Promise<{
        success: boolean,
        reqSend: boolean
    }>;
    revokeRequest(bookingId: string, userId: string): Promise<boolean>;
    isBookingAccepted(userId: string, vendorId: string, bookingId: string): Promise<BookingReqDocument | null>;
    makeBookingPayment(companyName: string, amount: string, bookingData: any): Promise<Stripe.Checkout.Session>;
    confirmPayment(bookingId: string, amountPaid: string, paymentId: string): Promise<BookingInterface>;
    makeMFPayments(paymentData:PaymentData):Promise<Stripe.Checkout.Session>;
    confirmMFPayment(bookingcId: string, amountPaid: number, paymentcId: string, paymentType: string): Promise<{success:boolean ,booking:BookingInterface}>;
    cancelBooking(bookingId: string, cancellationReason?: string): Promise<CancelBookingResult>;
    bookingReqsVendor(vendorId: string): Promise<BookingVendorResponse>;
    acceptRejectReq(bookingId: string, vendorId: string, action: string, rejectionReason?: string): Promise<void>;
    fetchAllBookings(search?: string): Promise<{
        success: boolean;
        bookingRequest: BookingInterface[];
        totalCount: number;
        message?: string;
    }>
}