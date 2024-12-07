import { BookingDocument } from "../models/bookingModel";


interface BookingCancelledPaymentOverdueData {
  serviceType: string;
  venue: string;
  startingDate: string;
  bookingReqId: string;
  advanceAmount: number;
  dueDate: string;
}

interface VendorBookingCancelledData {
  bookingId: string;
  clientName: string;
  startingDate: string;
  venue: string;
}


export const emailTemplates = {
  vendorAccepted: (vendorName: string) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #5e9ca0;">Congratulations, ${vendorName}!</h2>
        <p>Your vendor account for CaptureCrew has been accepted. You can now log in and start using our platform.</p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <br/>
        <p>Best Regards,<br/>CaptureCrew Team</p>
      </div>
    `,

  vendorRejected: (vendorName: string) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #5e9ca0;">Account Update</h2>
        <p>Dear ${vendorName},</p>
        <p>We regret to inform you that your vendor account for CaptureCrew has been rejected.</p>
        <p>If you have any questions or would like to appeal this decision, please contact our support team.</p>
        <br/>
        <p>Best Regards,<br/>CaptureCrew Team</p>
      </div>
    `,

  forgotPassword: (name: string, resetUrl: string) => `
       <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #5e9ca0;">Password Reset Request</h2>
        <p>Dear ${name},</p>
        <p>Please use the following link to reset your password. This link is valid for 5 minutes:</p>
            <a href="${resetUrl}">Reset Password</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <br/>
        <p>Best Regards,<br/>CaptureCrew Team</p>
      </div>
    `
  ,
  ResetPasswordSuccess: (name: string) => `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #5e9ca0;">Password Reset Successful</h2>
      <p>Hi ${name},</p>
      <p>Your password has been successfully changed. You can now log in using your new password.</p>
      <p>If this change was not made by you, please contact our support team immediately to secure your account.</p>
      <br/>
      <p>Best Regards,<br/>CaptureCrew Team</p>
    </div>
  `
  ,

  bookingAccepted: (name: string, bookingDetails: {
    serviceType: string,
    venue: string,
    startingDate: string,
    noOfDays: number,
    totalPrice: number,
    advanceAmount: number,
    finalAmount: number,
    advancePaymentDueDate: string,
    finalPaymentDueDate: string,
    bookingReqId: string | undefined,
    vendorName: string,
    companyName: string,
    vendorContact: string
  }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #5e9ca0; text-align: center;">Booking Confirmed!</h2>
      
      <p>Dear ${name},</p>
      
      <p>We're excited to inform you that your booking request (ID: ${bookingDetails.bookingReqId}) has been accepted by ${bookingDetails.companyName}.</p>

      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #5e9ca0; margin-top: 0;">Vendor Details</h3>
        <p><strong>Company:</strong> ${bookingDetails.companyName}</p>
        <p><strong>Photographer:</strong> ${bookingDetails.vendorName}</p>
        <p><strong>Contact:</strong> ${bookingDetails.vendorContact}</p>
      </div>

      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #5e9ca0; margin-top: 0;">Event Details</h3>
        <p><strong>Service:</strong> ${bookingDetails.serviceType}</p>
        <p><strong>Venue:</strong> ${bookingDetails.venue}</p>
        <p><strong>Date:</strong> ${bookingDetails.startingDate}</p>
        <p><strong>Duration:</strong> ${bookingDetails.noOfDays} day(s)</p>
        <p><strong>Total Price:</strong> ₹${bookingDetails.totalPrice.toLocaleString()}</p>
      </div>

      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #5e9ca0; margin-top: 0;">Payment Schedule</h3>
        <div style="margin-bottom: 10px;">
          <p><strong>Advance Payment (30%):</strong></p>
          <p>Amount: ₹${bookingDetails.advanceAmount.toLocaleString()}</p>
          <p>Due Date: ${bookingDetails.advancePaymentDueDate}</p>
        </div>
        
        <div>
          <p><strong>Final Payment (40%):</strong></p>
          <p>Amount: ₹${bookingDetails.finalAmount.toLocaleString()}</p>
          <p>Due Date: ${bookingDetails.finalPaymentDueDate}</p>
        </div>
      </div>

      <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="color: #856404; margin: 0;"><strong>Important:</strong> Please make the advance payment by ${bookingDetails.advancePaymentDueDate} to confirm your booking. Your booking will be automatically cancelled if the advance payment is not received by the due date.</p>
      </div>

      <p>For any queries, please feel free to contact your photographer at ${bookingDetails.vendorContact} or reach out to our support team.</p>
      
      <p>We look forward to making your event memorable!</p>
      
      <p style="margin-top: 30px;">Best Regards,<br/>CaptureCrew Team</p>
    </div>
  `,

  bookingRejected: (name: string, reason: string | undefined, bookingDetails: {
    serviceType: string,
    venue: string,
    startingDate: string,
    bookingReqId: string | undefined,
    vendorName: string,
    companyName: string,
    vendorContact: string
  }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #5e9ca0; text-align: center;">Booking Request Update</h2>
      
      <p>Dear ${name},</p>
      
      <p>We regret to inform you that your booking request (ID: ${bookingDetails.bookingReqId}) with ${bookingDetails.companyName} could not be accepted at this time.</p>

      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #5e9ca0; margin-top: 0;">Booking Details</h3>
        <p><strong>Service:</strong> ${bookingDetails.serviceType}</p>
        <p><strong>Venue:</strong> ${bookingDetails.venue}</p>
        <p><strong>Requested Date:</strong> ${bookingDetails.startingDate}</p>
        <p><strong>Vendor:</strong> ${bookingDetails.companyName}</p>
      </div>

      <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #856404; margin-top: 0;">Reason for Rejection</h3>
        <p style="color: #856404; margin: 0;">${reason}</p>
      </div>

      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #5e9ca0; margin-top: 0;">What's Next?</h3>
        <ul style="padding-left: 20px;">
          <li>Browse other available photographers on our platform</li>
          <li>Try different dates with the same photographer</li>
          <li>Contact our support team for assistance in finding alternatives</li>
        </ul>
      </div>

      <p>We appreciate your interest in booking through CaptureCrew and hope to help you find the perfect photographer for your event.</p>
      
      <p style="margin-top: 30px;">Best Regards,<br/>CaptureCrew Team</p>
    </div>
  `
  ,

  newBookingRequest: (vendorName: string, bookingDetails: {
    customerName: string,
    serviceType: string,
    venue: string,
    startingDate: string,
    bookingReqId: string | undefined,
    totalPrice: number,
    noOfDays: string | number,
    customerEmail: string,
    customerPhone: string,
    message: string
  }) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
    <h2 style="color: #5e9ca0; text-align: center;">New Booking Request</h2>
    
    <p>Dear ${vendorName},</p>
    
    <p>You have received a new booking request through CaptureCrew. Here are the details:</p>
    
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #5e9ca0; margin-top: 0;">Booking Details</h3>
        <p><strong>Request ID:</strong> ${bookingDetails.bookingReqId}</p>
        <p><strong>Service Type:</strong> ${bookingDetails.serviceType}</p>
        <p><strong>Event Date:</strong> ${bookingDetails.startingDate}</p>
        <p><strong>Duration:</strong> ${bookingDetails.noOfDays} day(s)</p>
        <p><strong>Venue:</strong> ${bookingDetails.venue}</p>
        <p><strong>Total Price:</strong> ₹${bookingDetails.totalPrice}</p>
    </div>

    <div style="background-color: #e8f4f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #5e9ca0; margin-top: 0;">Customer Information</h3>
        <p><strong>Name:</strong> ${bookingDetails.customerName}</p>
        <p><strong>Email:</strong> ${bookingDetails.customerEmail}</p>
        <p><strong>Phone:</strong> ${bookingDetails.customerPhone}</p>
        <p><strong>Message:</strong> ${bookingDetails.message}</p>
    </div>

    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #5e9ca0; margin-top: 0;">Next Steps</h3>
        <ul style="padding-left: 20px;">
            <li>Review the booking details carefully</li>
            <li>Check your availability for the requested date</li>
            <li>Accept or reject the request through your vendor dashboard</li>
            <li>Respond within 24 hours to maintain good service standards</li>
        </ul>
    </div>

    <p style="margin-top: 30px;">Best Regards,<br/>CaptureCrew Team</p>
</div>
`
  ,
  bookingRequestConfirmation: (details: {
    customerName: string,
    vendorName: string,
    serviceType: string,
    venue: string,
    startingDate: string,
    bookingReqId: string | undefined,
    totalPrice: number,
    noOfDays: string | number,
}) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
    <h2 style="color: #5e9ca0; text-align: center;">Booking Request Submitted</h2>

    <p>Dear ${details.customerName},</p>

    <p>Your booking request has been successfully submitted to the vendor, ${details.vendorName}. Here are the details:</p>

    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #5e9ca0; margin-top: 0;">Booking Details</h3>
        <p><strong>Request ID:</strong> ${details.bookingReqId}</p>
        <p><strong>Service Type:</strong> ${details.serviceType}</p>
        <p><strong>Event Date:</strong> ${details.startingDate}</p>
        <p><strong>Duration:</strong> ${details.noOfDays} day(s)</p>
        <p><strong>Venue:</strong> ${details.venue}</p>
        <p><strong>Total Price:</strong> ₹${details.totalPrice}</p>
    </div>

    <p>The vendor will review your request and get back to you shortly.</p>

    <p style="margin-top: 30px;">Best Regards,<br/>CaptureCrew Team</p>
</div>
`
,
  paymentConfirmation: (bookingDetails: BookingDocument, paymentType:'finalAmount') => `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #5e9ca0;">Payment Confirmation - CaptureCrew</h2>
            <p>Dear ${bookingDetails.clientName},</p>
            
            <p>We are pleased to confirm that your ${paymentType} 
            for booking #${bookingDetails._id} has been successfully processed.</p>
            
            <h3>Payment Details:</h3>
            <ul>
                <li><strong>Booking ID:</strong> ${bookingDetails._id}</li>
                <li><strong>Payment Type:</strong> ${paymentType}</li>
                <li><strong>Amount Paid:</strong> ${bookingDetails.finalPayment.amount}</li>
                <li><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
            
            <p>Thank you for choosing CaptureCrew. If you have any questions, please contact our support team.</p>
            
            <p>Best Regards,<br/>CaptureCrew Team</p>
        </div>
    `,

  vendorPaymentNotification: (bookingDetails: BookingDocument, paymentType: 'finalAmount') => `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #5e9ca0;">Payment Received - CaptureCrew</h2>
            <p>Dear ${bookingDetails.vendorId},</p>
            
            <p>A ${paymentType} 
            has been received for booking #${bookingDetails._id}.</p>
            
            <h3>Payment Details:</h3>
            <ul>
                <li><strong>Booking ID:</strong> ${bookingDetails._id}</li>
                <li><strong>Payment Type:</strong> ${paymentType}</li>
                <li><strong>Amount Received:</strong> ${bookingDetails.finalPayment.amount}</li>
                <li><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
            
            <p>Thank you for being a part of CaptureCrew.</p>
            
            <p>Best Regards,<br/>CaptureCrew Team</p>
        </div>
    `

    ,


    bookingCancelledPaymentOverdue: (clientName: string, data: BookingCancelledPaymentOverdueData) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            margin-bottom: 30px;
        }
        .important {
            color: #dc3545;
            font-weight: bold;
        }
        .details {
            background-color: #f8f9fa;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 0.9em;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Booking Cancellation Notice</h2>
        </div>

        <p>Dear ${clientName},</p>

        <p>We regret to inform you that your booking with CaptureCrew has been <span class="important">automatically cancelled</span> due to non-receipt of the advance payment by the due date.</p>

        <div class="details">
            <h3>Booking Details:</h3>
            <p>Booking Reference: ${data.bookingReqId}</p>
            <p>Service Type: ${data.serviceType}</p>
            <p>Venue: ${data.venue}</p>
            <p>Event Date: ${data.startingDate}</p>
            <p>Advance Payment Amount: ₹${data.advanceAmount}</p>
            <p>Payment Due Date: ${data.dueDate}</p>
        </div>

        <p>As per our booking terms and conditions, advance payment was required to be made by ${data.dueDate} to confirm your booking. Since we did not receive the payment, the booking has been cancelled and the dates have been released.</p>

        <p>If you still wish to book our services, you will need to submit a new booking request through our platform. Please note that the previously blocked dates are now available to other clients, and availability cannot be guaranteed.</p>

        <p>If you believe this cancellation was made in error or if you have already made the payment, please contact our support team immediately with your payment proof.</p>

        <div class="footer">
            <p>Best regards,<br>Team CaptureCrew</p>
            <p>For any questions or concerns, please contact our support team.<br>
            Email: support@capturecrew.com<br>
            Phone: +91-XXXXXXXXXX</p>
        </div>
    </div>
</body>
</html>
    `,

    // Template for vendor notification
    vendorBookingCancelledPaymentOverdue: (data: VendorBookingCancelledData) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            margin-bottom: 30px;
        }
        .details {
            background-color: #f8f9fa;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 0.9em;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Booking Cancellation Notice</h2>
        </div>

        <p>Dear Vendor,</p>

        <p>This is to notify you that a booking has been automatically cancelled due to non-receipt of advance payment from the client.</p>

        <div class="details">
            <h3>Booking Details:</h3>
            <p>Booking Reference: ${data.bookingId}</p>
            <p>Client Name: ${data.clientName}</p>
            <p>Event Date: ${data.startingDate}</p>
            <p>Venue: ${data.venue}</p>
        </div>

        <p>The dates associated with this booking have been automatically released and are now available for new bookings.</p>

        <p>No further action is required from your side. The client has been notified of the cancellation.</p>

        <div class="footer">
            <p>Best regards,<br>Team CaptureCrew</p>
            <p>For any questions or concerns, please contact our support team.<br>
            Email: support@capturecrew.com<br>
            Phone: +91-XXXXXXXXXX</p>
        </div>
    </div>
</body>
</html>
    `


};