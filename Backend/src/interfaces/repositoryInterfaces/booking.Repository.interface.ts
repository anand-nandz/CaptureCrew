import { BookingDocument } from "../../models/bookingModel";
import { BookingInterface } from "../commonInterfaces";

export interface IBookingRepository {
    findBookingConfirmedReqs(userId: string): Promise<BookingInterface[] | null>;
    saveBooking(bookingData: Partial<BookingInterface>): Promise<BookingInterface>;
    getById(id: string): Promise<BookingDocument | null>; 
    updatePayment(bookingId: string, amountPaid: number, paymentId: string, paymentType:'finalAmount'): Promise<BookingDocument>;
    findBooking(bookingId: string): Promise<BookingDocument | null>;
    updateBookingStatus(bookingId: string, update: object): Promise<void>;
    findBookingConfirmedReqsV(vendorId: string): Promise<BookingInterface[] | null>;
    getRevenueData(
        vendorId: string,
        start: Date,
        end: Date,
        groupBy: object,
        sortField: string
    ): Promise<{ _id: { [key: string]: number }; totalRevenue: number }[]>;
    getAllRevenueData(
        start: Date,
        end: Date,
        groupBy: object,
        sortField: string
    ): Promise<{ _id: { [key: string]: number }; totalRevenue: number }[]>;
    getAllBookings(searchQuery?: string): Promise<BookingInterface[]>;
}