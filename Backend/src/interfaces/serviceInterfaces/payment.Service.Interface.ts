import Stripe from "stripe";
import { PaymentData, RefundResult } from "../commonInterfaces";
import { BookingDocument } from "../../models/bookingModel";

export interface IPaymentService {
    makeThePayment(companyName: string, amount: string | any, bookingData: any): Promise<Stripe.Checkout.Session>
    makeMFPayment(amount: number, paymentData: PaymentData): Promise<Stripe.Checkout.Session>;
    processRefund(booking: BookingDocument): Promise<RefundResult>;
}