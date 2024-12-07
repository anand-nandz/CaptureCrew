import { Transaction } from "./extraTypes";

export interface VendorData{
    _id:string;
    email : string;
    password : string;
    name : string;
    companyName:string;
    city : string ;
    about?:string ;
    contactinfo?: string;
    isActive:boolean;
    isVerified:boolean;
    isAccepted:AcceptanceStatus;
    logo:string;
    imageUrl?: string ;
    totalBooking?:number;
    bookedDates:Array<string>;
    walletBalance: number;
    transactions?: Transaction[];
    refreshToken:string;
    totalRating?:number; 
    postCount?:number;
    reportCount?: number;
    createdAt: string;  
    updatedAt: string;  
}

export interface VendorFormValues {
    email: string;
    password: string;
    name: string;
    city : string
    contactinfo: string;
    confirmPassword: string;
    companyName: string;
    about: string,
  }

  export enum AcceptanceStatus {
    Requested = 'requested',
    Accepted = 'accepted',
    Rejected = 'rejected'
}

export interface VendorResponse {
  vendors: Array<{
    _doc: VendorData;
    imageUrl?: string;
  }>;
  totalPages: number;
}