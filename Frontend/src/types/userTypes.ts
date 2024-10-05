export interface UserData{
    _id:string;
    email : string;
    password : string;
    name : string;
    contactinfo : number;
    isActive:boolean;
    isBlocked:boolean;
    image:string;
    imageUrl:string;
    favourite:string[];
    refreshToken:string;
}