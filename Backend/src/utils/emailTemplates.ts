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
  


};