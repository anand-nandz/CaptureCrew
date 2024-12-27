import { ServiceProvided } from "./postTypes";

export interface PackageData {
    _id: string;
    serviceType: ServiceProvided;
    price: number;
    description?: string;
    duration: number;  // in hours
    photographerCount?: number;
    videographerCount?: number;
    features: string[];
    customizationOptions: CustomizationOption[];
    vendor_id: string 
    createdAt: string;
}


export interface PackageFormData {
    serviceType: ServiceProvided | '';
    price: number;
    description?: string;
    duration: number;
    photographerCount: number;
    videographerCount: number;
    features: string[];
    customizationOptions: CustomizationOption[];

}


export interface CustomizationOption {
    _id: string;
    type: string;
    description: string;
    price: number;
    unit?: string; 
}


export interface CustomizationOptionPackage {
    _id?: string;
    type: string;
    description: string;
    price: number;
    unit?: string; 
}

export interface FormErrors {
    serviceType?: string;
    price?: string;
    description?: string;
    duration?: string;
    photographerCount?: string;
    videographerCount?: string;
    features?: string;
    customizationOptions?: string;
    optionErrors?: Array<{
        type?: string;
        description?: string;
        price?: string;
        unit?: string;
    }>;
}


export interface Package {
    _id: string;
    serviceType: string;
    description: string;
    price: number;
    duration: number;
    features: string[];
    customizationOptions: CustomizationOption[];
    isActive: boolean;
    photographerCount: number;
    videographerCount: number;
    vendor_id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}
