export interface VendorData{
    _id:string;
    email : string;
    password : string;
    name : string;
    city : string ;
    about :string ;
    contactinfo : number;
    isActive:boolean;
    isVerified:boolean;
    verificationRequest:boolean;
    logo:string;
    profilepic : string ;
    totalBooking:number;
    bookedDates:Array<string>;
    refreshToken:string;
    totalRating:number;
}

export interface VendorFormValues {
    email: string;
    password: string;
    name: string;
    city : string
    contactinfo: string;
    confirmPassword: string;
  }