

export enum TransactionType {
    Credit = 'credit',
    Debit = 'debit'
}

export enum PaymentType {
    Booking = 'booking',
    Refund = 'refund',
    Cancellation = 'cancellation',
    Other = 'other'
}

export enum PaymentMethod {
    STRIPE = 'stripe',
    RAZORPAY = 'razorpay'
}


export enum PaymentStatus {
    Pending = 'pending',
    Completed = 'completed',
    Failed = 'failed',
    Refund = 'refunded'

}

export enum ServiceProvided {
    Engagement = 'Engagement',
    Wedding = 'Wedding',
    Birthday = 'Birthday Party',
    OutdoorShoot = "Outdoor Shoot"
}

export enum PostStatus {
    Draft = 'Draft',
    Published = 'Published',
    Archived = 'Archived',
    Blocked = 'Blocked'
}

export enum AcceptanceStatus {
    Requested = 'requested',
    Accepted = 'accepted',
    Rejected = 'rejected'
}

export enum BookingAcceptanceStatus {
    Requested = 'requested',
    Accepted = 'accepted',
    Rejected = 'rejected',
    Revoked = 'revoked',
    PaymentOverdue = 'overdue'
}


export enum BookingStatus {
    Confirmed = 'confirmed',
    Cancelled = 'cancelled',
    Completed = 'completed',
}

export enum BlockStatus {
    BLOCK = 'block',
    UNBLOCK = 'unblock',
}


export const OTP_EXPIRY_TIME = 2 * 60 * 1000;
export const RESEND_COOLDOWN = 2 * 60 * 1000;