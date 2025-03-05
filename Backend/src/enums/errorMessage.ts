enum Messages {
    SAVE_SESSION = 'Error saving session',
    GENERATE_OTP = "Couldn't generate OTP",
    SESSION_EXPIRED = 'Session expired. Please try again.',
    OTP_EXPIRED = 'OTP has expired. Please request a new one.',
    
    INVALID_OTP = 'Invalid OTP',
    INVALID_TOKEN = 'Invalid Token',
    OTP_SENT = `OTP send to Email for Verification`,
    ACCOUNT_CREATED = 'Account created successfully!',
    NO_REFRESHTOKEN = 'No refresh token provided',
    REFRESHTOKEN_EXP = 'Refresh token expired',
    VENDOR_NOT_FOUND = 'Vendor not found',
    USER_NOT_FOUND = 'User not found',
    BLOCKED = 'Blocked by Admin',
    EMAIL_REQUIRED = 'Email is required',
    PASSWORD_REQUIRED = 'Password is required',
    TOKEN_REQUIRED = 'Token is required',
    PASSWORD_RESET_LINK = 'Password reset link sent to your email' ,
    PASSWORD_RESET_SUCCESS = 'Password Reset Successfull',
    AUTHENTICATION_REQUIRED = 'Authentication required' ,
    TOKEN_NOT_VALID ='Token is not valid',
    INVALID_PAYLOAD ='Token payload is invalid',

    USER_ID_MISSING = 'User ID is missing',
    VENDOR_ID_MISSING = 'Vendor ID is missing',
    POST_ID_MISSING = 'Post ID is missing or invalid',
    ADMIN_ID_MISSING = 'Admin id not found>',

    COULDNOT_ADD_REVIEW = "Couldn't add reviews",
    ADDED_REVIEW = 'Review Added for this booking.',
    REVIEW_UPDATED = 'Review updated successfully',
    REPORT_SUBMITTED = 'Report Submitted succesfully',
    BOOKING_CANCELLED = 'Booking cancelled successfully',
    BOOKING_ID_MISSING = 'BookingId is missing or invalid',
    FAILED_CONFIRM_PAYMENT = 'Failed to confirm payment',
    MISSING_PAYMENT_INFO = 'Missing required payment information',

    UPDATE_USER_STATUS = 'User block/unblock status updated succesfully.',
    UPDATE_POST_STATUS = 'Post status updated successfully',
    DASHBOARD_DETAILS =  'Dashboard statistics retrieved successfully',
    


 
 };
 
 export default Messages;