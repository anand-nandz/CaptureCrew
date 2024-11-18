
export interface PackageDetails {
    price: number;
    description: string;
    photographerCount: number;
    features: string[];
    customizationOptions: Array<{
        name: string;
        price: number;
    }>;
}

export interface VendorDetails {
    name: string;
    companyName: string;
    city: string;
    contactinfo: string;
}

export interface PaymentDetails {
    amount: number;
    status: string;
    paidAt?: string;
}

export interface BookingResponse {
    _id: string;
    name: string;
    email: string;
    phone: string;
    venue: string;
    serviceType: string;
    startingDate: string;
    totalPrice: number;
    noOfDays: number;
    message: string;
    bookingStatus: string;
    rejectionReason?: string;
    packageId: PackageDetails;
    vendor_id: VendorDetails;
    customizations: string[];
    advancePaymentDueDate?: string;
    advancePayment?: PaymentDetails;
    createdAt: string;
}