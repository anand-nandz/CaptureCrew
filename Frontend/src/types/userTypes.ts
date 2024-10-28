export interface UserData {
    _id: string;
    email: string;
    password?: string;
    name: string;
    contactinfo?: string;
    isActive: boolean;
    isBlocked: boolean;
    isGoogleUser: boolean;
    image?: string | null | undefined;
    imageUrl?: string;
    favourite: string[];
    refreshToken?: string;
    createdAt: string;  
    updatedAt: string;  
  }
  


  export interface UserFormValues {
    email: string;
    password: string;
    name: string;
    contactinfo: string;
    confirmPassword: string;
    isGoogleUser?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  