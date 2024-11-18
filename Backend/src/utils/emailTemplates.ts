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
    midAmount: number,
    finalAmount: number,
    advancePaymentDueDate: string,
    midPaymentDueDate: string,
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
        
        <div style="margin-bottom: 10px;">
          <p><strong>Mid-Event Payment (30%):</strong></p>
          <p>Amount: ₹${bookingDetails.midAmount.toLocaleString()}</p>
          <p>Due Date: ${bookingDetails.midPaymentDueDate}</p>
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


};