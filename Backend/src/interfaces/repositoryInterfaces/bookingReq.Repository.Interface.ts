import mongoose from "mongoose";
import { BookingReqInterface } from "../commonInterfaces";
import { BookingAcceptanceStatus } from "../../enums/commonEnums";
import { BookingReqDocument } from "../../models/bookingRequestModel";

export interface IBookingReqRepository{
    findBookingRequests(userId: string): Promise<BookingReqInterface[] | null>;
    getById(id: string): Promise<BookingReqDocument | null>; 
    checkIsAvailable(startingDate: string, vendorId: string): Promise<boolean | undefined>;
    saveBookingReq(
        userId: string,
        vendorId: string,
        startingDate: string,
        noOfDays: string,
        name: string,
        email: string,
        phone: string,
        venue: string,
        serviceType: string,
        packageId: string | mongoose.Types.ObjectId,
        totalPrice: number,
        message: string,
        bookingStatus: BookingAcceptanceStatus,
        customizations: string[] | undefined,
    ): Promise<BookingReqInterface | null>;
    deleteReq(bookingId: string, userId: string): Promise<boolean>;
    validateBooking(bookingId: string, userId: string, expectedStatus: BookingAcceptanceStatus): Promise<BookingReqDocument>;
    findBookingById(userId: string, vendorId: string, bookingId: string): Promise<BookingReqDocument | null>
    acceptUpdate(vendorId: string, dates: string[]): Promise<boolean>;
    deleteBookingRequest(bookingId: string): Promise<void>
    overdueBookings(): Promise<BookingReqDocument[]>;
    getBookingReqsVendor(vendorId: string): Promise<BookingReqInterface[] | null >;
    update(id: string, data: Partial<BookingReqDocument>): Promise<BookingReqDocument | null>;
    rollbackVendorDates(vendorId: string, datesToRemove: string[]): Promise<void> 


}