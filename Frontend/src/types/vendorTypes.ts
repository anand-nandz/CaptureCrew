export interface VendorData{
    _id:string;
    email : string;
    password : string;
    name : string;
    companyName:string;
    city : string ;
    about :string ;
    contactinfo : string;
    isActive:boolean;
    isVerified:boolean;
    isAccepted:AcceptanceStatus;
    logo:string;
    profilepic : string ;
    totalBooking:number;
    bookedDates:Array<string>;
    refreshToken:string;
    totalRating:number;
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