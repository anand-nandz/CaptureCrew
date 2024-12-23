import { UserData } from "./userTypes";

export interface Transaction {
    _id: string;
    amount: number;
    transactionType: TransactionType;
    paymentType: PaymentType;
    paymentMethod: PaymentMethod,
    paymentId?: string,
    description?: string;
    bookingId?: string;
    createdAt: Date;
    status: PaymentStatus ;
  }

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
  

  export interface Chats {
    _id: string;
    members: string[];
    recentMessage: string;
    updatedAt: Date;
    createdAt: Date
  }

  export interface Messages {
    _id:string;
    conversationId: string;
    senderId: string;
    text: string;
    imageName?: string;
    imageUrl?: string;
    isRead: boolean;
    isDeleted: boolean;
    deletedIds: string[];
    emoji?: string;
    createdAt: number
  }

  
export interface ActiveUser {
  userId: string;
  clientId: string;
  isActive: boolean;
}

export interface VendorReview {
  _id: string;
  userId: UserData;
  rating: number;
  content: string;
  reply?: Array<string>;
  createdAt: string;
}



export const formatMessageTime =(updatedAt?: number | string | Date): string  => {
  if (!updatedAt) return ''; 

  const createdAtDate = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  const now = new Date();
  const differenceInDays = Math.floor((now.getTime() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24));

  if (differenceInDays === 0) {
      return new Date(createdAtDate).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
      });
  } else if (differenceInDays === 1) {
      return "yesterday";
  } else {
      return new Date(createdAtDate).toLocaleDateString();
  }
};

export type TabValue = 'bookingHistory' | 'bookingRequests' | 'bookingConfirmed';

