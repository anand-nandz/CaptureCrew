import stripe, { Stripe } from 'stripe';
import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv'
import { CustomError, StripeRefundError } from '../error/customError';
import { BookingDocument } from '../models/bookingModel';
import { IPaymentService } from '../interfaces/serviceInterfaces/payment.Service.Interface';
import { PaymentData, RefundResult } from '../interfaces/commonInterfaces';
dotenv.config()

const Api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true
})

const stripeClient = new stripe(process.env.STRIPE_PRIVATE_KEY as string);

class PaymentService implements IPaymentService{
    async makeThePayment(
        companyName: string,
        amount: string | any,
        bookingData: any
    ) : Promise<Stripe.Checkout.Session>{
        try {
            
            const line_items = [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `${bookingData.serviceType} Photography Booking`,
                            description: `
            Booking Details:
            • Event: ${bookingData.serviceType}/br
            • Date(s): ${bookingData.requestedDates.join(', ')}/br
            • Venue: ${bookingData.venue}
            • Duration: ${bookingData.noOfDays} day(s)
            • Booking ID: ${bookingData.bookingReqId}
                            `.trim(),
                            metadata: {
                                booking_id: bookingData.bookingReqId,
                                customer_name: bookingData.name,
                                customer_email: bookingData.email,
                                event_type: bookingData.serviceType,
                                booking_dates: bookingData.requestedDates.join(', '),
                                venue: bookingData.venue,
                                total_amount: bookingData.totalPrice,
                                advance_amount: bookingData.advancePayment.amount
                            },
                            images: [], 
                        },
                        unit_amount: Number(amount) * 100
                    },
                    quantity: 1
                }
            ];

            const session = await stripeClient.checkout.sessions.create({
                success_url: `${process.env.BACKEND_URL}/api/user/confirmPayment`,
                cancel_url: `${process.env.FRONTEND_URL}/paymentFailed`,
                line_items: line_items,
                mode: 'payment',
                expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
                metadata: {
                    bookingId: bookingData._id,
                    vendorId: bookingData.vendor_id
                }
            })

            return session


        } catch (error) {
            console.error('Error in makeBookingPayment:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to make payment.', 500);
        }

    }


    async makeMFPayment(amount: number, paymentData: PaymentData): Promise<Stripe.Checkout.Session> {

        try {
           
            const line_items = [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `${paymentData.paymentType} for ${paymentData.sbooking.requestedDates}`
                        },
                        unit_amount: Number(amount) * 100
                    },
                    quantity: 1
                }
            ]

            const session = await stripeClient.checkout.sessions.create({
                success_url: `${process.env.BACKEND_URL}/api/user/confirmMFPayment`,
                cancel_url: `${process.env.FRONTEND_URL}/paymentFailed`,
                line_items: line_items,
                mode: 'payment',
                expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
                metadata: {
                    bookingId: paymentData._id,
                    vendorId: paymentData.sbooking.vendorId._id
                }
            })

            return session


        } catch (error) {
            console.error('Error in makeBookingPayment:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to make payment.', 500);
        }

    }

    async processRefund(booking: BookingDocument): Promise<RefundResult>{
        const session = await stripeClient.checkout.sessions.retrieve(booking.advancePayment.paymentId);
        const paymentIntentId = session.payment_intent;
        console.log(paymentIntentId,'paymentIntentId');
        
        if (!paymentIntentId || typeof paymentIntentId !== 'string') {
            throw new Error('Invalid payment intent ID');
        }
        const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
        console.log(paymentIntent,'paymentIntent');

        if (!paymentIntent) {
            throw new Error('Payment intent not found');
        }
        // const refund = await stripeClient.refunds.create({
        //     payment_intent: paymentIntentId,
        //     amount: Math.floor(booking.advancePayment.amount * 100) // Convert to cents
        // });
        

        // console.log(refund,'refund detailsssssssss');

        // return { success: true, refundId: refund.id };
        try {
            const refund = await stripeClient.refunds.create({
                payment_intent: paymentIntentId,
                amount: Math.floor(booking.advancePayment.amount * 100) 
            });

            console.log(refund, 'refund detailsssssssss');

            return { success: true, refundId: refund.id };
        } catch (error: unknown) {
            if (
                error instanceof Error && 
                'type' in error && 
                'code' in error && 
                (error as { type: string, code: string }).type === 'StripeInvalidRequestError' && 
                (error as { type: string, code: string }).code === 'charge_already_refunded'
            ) {
                throw new StripeRefundError(
                    error.message, 
                    (error as { type: string }).type, 
                    (error as { code: string }).code
                );
            }
            throw error;
        }

    }
}

export default PaymentService;